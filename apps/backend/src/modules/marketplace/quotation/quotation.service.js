import prisma from '../../../core/lib/prisma.js';
import { Prisma } from '@prisma/client';

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

  if (listing.status !== 'PUBLISHED') {
    throw new Error('Can only submit quotations for PUBLISHED listings');
  }

  if (listing.scrapRecord.ownerId === organisationId) {
    throw forbiddenError('Cannot submit a quotation on your own listing');
  }

  // Use Decimal for exact financial arithmetic (avoids floating-point drift)
  const totalValue = new Prisma.Decimal(data.pricePerKg).mul(
    new Prisma.Decimal(data.quantityKg)
  );

  return await prisma.quotation.create({
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
};

export const getQuotations = async (filters, organisationId, role) => {
  const where = {};

  // If industry, get quotations received for their listings
  // If buyer/dealer, get quotations they submitted
  if (role === 'INDUSTRY') {
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
      throw new Error('Quotation is not in SUBMITTED state');
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

    await tx.listing.update({
      where: { id: quotation.listingId },
      data: { status: 'OFFER_ACCEPTED' }
    });

    return tx.quotation.findUnique({ where: { id } });
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
