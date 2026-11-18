import prisma from '../../../core/lib/prisma.js';
import { Prisma } from '@prisma/client';
import {
  notifyQuotationReceived,
  notifyQuotationAccepted,
  notifyQuotationRejected
} from '../../notification/notification.service.js';

const notFoundError = (message = 'Quotation not found') => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

const forbiddenError = (message) => {
  const error = new Error(message);
  error.statusCode = 403;
  return error;
};

export const createQuotation = async (data, userId, organisationId) => {
  // Validate that the listing exists and is active
  const listing = await prisma.listing.findUnique({
    where: { id: data.listingId },
    include: { scrapRecord: true }
  });

  if (!listing) {
    throw notFoundError('Listing not found');
  }

  if (listing.status === 'DRAFT') {
    const err = new Error('This listing is not yet published and cannot receive quotations.');
    err.statusCode = 400;
    throw err;
  }

  if (['CANCELLED', 'COMPLETED', 'OFFER_ACCEPTED', 'PAYMENT_PENDING', 'BIDDING_CLOSED', 'EXPIRED'].includes(listing.status)) {
    throw new Error('Cannot submit quotation on closed, cancelled, or completed listings');
  }

  if (listing.scrapRecord.ownerId === organisationId) {
    throw forbiddenError('Cannot submit a quotation on your own listing');
  }

  // One active quotation per buyer per listing
  const existing = await prisma.quotation.findFirst({
    where: {
      listingId: data.listingId,
      buyerId: organisationId,
      status: { in: ['SUBMITTED', 'ACCEPTED'] }
    }
  });
  if (existing) {
    const err = new Error(
      existing.status === 'ACCEPTED'
        ? 'Your quotation for this listing has already been accepted.'
        : 'You have already submitted a quotation for this listing. Withdraw it before submitting a new one.'
    );
    err.statusCode = 409;
    throw err;
  }

  // Use Decimal for exact financial arithmetic (avoids floating-point drift)
  const totalValue = new Prisma.Decimal(data.pricePerKg).mul(
    new Prisma.Decimal(data.quantityKg)
  );

  const quotation = await prisma.quotation.create({
    data: {
      listingId: data.listingId,
      buyerId: organisationId,
      pricePerKg: data.pricePerKg,
      quantityKg: data.quantityKg,
      totalValue,
      paymentTerms: data.paymentTerms,
      note: data.note,
      isSealed: data.isSealed || false,
      validUntil: data.validUntil,
      status: 'SUBMITTED',
      submittedByUserId: userId
    }
  });

  // Notify seller organisation users
  try {
    const sellerOrg = await prisma.organisation.findUnique({
      where: { id: listing.scrapRecord.ownerId },
      include: { users: { take: 1 } }
    });
    if (sellerOrg?.users?.[0]?.id) {
      await notifyQuotationReceived(
        sellerOrg.users[0].id,
        quotation.id,
        listing.scrapRecord.description || 'Scrap Material',
        data.pricePerKg
      );
    }
  } catch (e) {
    console.error('Error triggering quotation notification:', e);
  }

  return quotation;
};


export const getQuotations = async (filters, organisationId, role) => {
  const where = {};

  // Industry: always see received quotations on their listings
  // Dealer with view=received: see quotations received on their own listings (as seller)
  // Dealer/Buyer default: see quotations they submitted
  if (role === 'INDUSTRY' || (role === 'DEALER' && filters.view === 'received')) {
    where.listing = {
      scrapRecord: { ownerId: organisationId }
    };
  } else {
    where.buyerId = organisationId;
  }

  if (filters.listingId) {
    where.listingId = filters.listingId;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  return await prisma.quotation.findMany({
    where,
    include: {
      listing: {
        include: { scrapRecord: true }
      },
      buyer: {
        select: { companyName: true, contactName: true, contactPhone: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getQuotationById = async (id, organisationId, role) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      listing: {
        include: { scrapRecord: true }
      },
      buyer: {
        select: { companyName: true, contactName: true, contactPhone: true }
      }
    }
  });

  if (!quotation) {
    throw notFoundError();
  }

  // Auth check: either they submitted it (buyer), or they own the listing (industry)
  const isOwner = quotation.buyerId === organisationId;
  const isListingOwner = quotation.listing.scrapRecord.ownerId === organisationId;

  if (!isOwner && !isListingOwner) {
    throw forbiddenError('Unauthorized to view this quotation');
  }

  return quotation;
};

// Accept quotation (Industry action)
export const acceptQuotation = async (id, organisationId) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { listing: { include: { scrapRecord: true } } }
  });

  if (!quotation) throw notFoundError();

  if (quotation.listing.scrapRecord.ownerId !== organisationId) {
    throw forbiddenError('Unauthorized to accept this quotation');
  }

  if (quotation.validUntil && new Date(quotation.validUntil) < new Date()) {
    await prisma.quotation.updateMany({
      where: { id, status: 'SUBMITTED' },
      data: { status: 'EXPIRED' }
    });
    throw new Error('Quotation has expired and cannot be accepted');
  }

  return await prisma.$transaction(async (tx) => {
    // Atomically accept only if still SUBMITTED, closing the race window
    const accepted = await tx.quotation.updateMany({
      where: { id, status: 'SUBMITTED' },
      data: { status: 'ACCEPTED' }
    });

    if (accepted.count === 0) {
      throw new Error('Quotation is not in SUBMITTED state or already accepted');
    }

    // Reject sibling quotations on the same listing so only one can ever be accepted
    await tx.quotation.updateMany({
      where: {
        listingId: quotation.listingId,
        id: { not: id },
        status: 'SUBMITTED'
      },
      data: { status: 'REJECTED' }
    });

    // Update listing status
    await tx.listing.update({
      where: { id: quotation.listingId },
      data: { status: 'OFFER_ACCEPTED' }
    });

    // Create Sale record atomically
    let saleRecord = await tx.sale.findUnique({
      where: { quotationId: id }
    });

    if (!saleRecord) {
      saleRecord = await tx.sale.create({
        data: {
          listingId: quotation.listingId,
          quotationId: id,
          sellerId: quotation.listing.scrapRecord.ownerId,
          buyerId: quotation.buyerId,
          quantityKg: quotation.quantityKg,
          pricePerKg: quotation.pricePerKg,
          totalValue: quotation.totalValue,
          status: 'PENDING_PAYMENT',
          paymentExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });
    }

    // Inventory creation and quantity updates happen only after payment (in sale COMPLETED transition)

    const result = await tx.quotation.findUnique({
      where: { id },
      include: {
        listing: { include: { scrapRecord: true } },
        buyer: true
      }
    });

    // Notify buyer that their quotation was accepted (fire-and-forget)
    try {
      const buyerOrg = await prisma.organisation.findUnique({
        where: { id: quotation.buyerId },
        include: { users: { take: 1 } }
      });
      if (buyerOrg?.users?.[0]?.id) {
        await notifyQuotationAccepted(
          buyerOrg.users[0].id,
          id,
          quotation.listing.scrapRecord.description || 'Scrap Material'
        );
      }
    } catch (e) {
      console.error('Error sending quotation accepted notification:', e);
    }

    return result;
  });

};

// Reject quotation (Industry action)
export const rejectQuotation = async (id, organisationId) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { listing: { include: { scrapRecord: true } } }
  });

  if (!quotation) throw notFoundError();

  if (quotation.listing.scrapRecord.ownerId !== organisationId) {
    throw forbiddenError('Unauthorized to reject this quotation');
  }

  const result = await prisma.quotation.updateMany({
    where: { id, status: 'SUBMITTED' },
    data: { status: 'REJECTED' }
  });

  if (result.count === 0) {
    throw new Error('Can only reject SUBMITTED quotations');
  }

  // Notify buyer that their quotation was rejected (fire-and-forget)
  try {
    const buyerOrg = await prisma.organisation.findUnique({
      where: { id: quotation.buyerId },
      include: { users: { take: 1 } }
    });
    if (buyerOrg?.users?.[0]?.id) {
      await notifyQuotationRejected(
        buyerOrg.users[0].id,
        id,
        quotation.listing.scrapRecord.description || 'Scrap Material'
      );
    }
  } catch (e) {
    console.error('Error sending quotation rejected notification:', e);
  }

  return prisma.quotation.findUnique({ where: { id } });
};

// Withdraw quotation (Buyer action)
export const withdrawQuotation = async (id, organisationId) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id }
  });

  if (!quotation) throw notFoundError();

  if (quotation.buyerId !== organisationId) {
    throw forbiddenError('Unauthorized to withdraw this quotation');
  }

  const result = await prisma.quotation.updateMany({
    where: { id, status: 'SUBMITTED' },
    data: { status: 'WITHDRAWN' }
  });

  if (result.count === 0) {
    throw new Error('Can only withdraw SUBMITTED quotations');
  }

  return prisma.quotation.findUnique({ where: { id } });
};
