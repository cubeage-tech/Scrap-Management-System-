import prisma, { Prisma } from '../../../core/lib/prisma.js';
import { notifySaleCompleted } from '../../notification/notification.service.js';

const notFoundError = (msg = 'Sale record not found') => {
  const error = new Error(msg);
  error.statusCode = 404;
  return error;
};

const forbiddenError = (msg = 'Unauthorized to access this sale record') => {
  const error = new Error(msg);
  error.statusCode = 403;
  return error;
};

/**
 * Get sales list for logged-in organization (as seller or buyer)
 */
export const getSales = async (organisationId, role, filters = {}) => {
  const { status, search, page = 1, limit = 20 } = filters;

  const where = {};

  if (role === 'BUYER') {
    where.buyerId = organisationId;
  } else if (role === 'DEALER') {
    // Dealer as seller (resales to buyers) vs dealer as buyer (purchases from industry)
    if (filters.view === 'sales') {
      where.sellerId = organisationId;
    } else {
      where.buyerId = organisationId;
    }
  } else {
    // INDUSTRY / SUPER_ADMIN
    where.sellerId = organisationId;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { buyer: { companyName: { contains: search, mode: 'insensitive' } } },
      { seller: { companyName: { contains: search, mode: 'insensitive' } } },
      { listing: { scrapRecord: { description: { contains: search, mode: 'insensitive' } } } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        listing: {
          include: {
            scrapRecord: {
              include: { category: true }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            contactPhone: true,
            city: true,
            state: true
          }
        },
        seller: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            contactPhone: true,
            city: true,
            state: true
          }
        },
        acceptedByUser: { select: { id: true, contactName: true, email: true } },
        completedByUser: { select: { id: true, contactName: true, email: true } },
        sourceInventory: { select: { id: true } },
        payment: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    }),
    prisma.sale.count({ where })
  ]);

  return { sales, total, page: pageNum, limit: limitNum };
};

/**
 * Get single sale details by ID
 */
export const getSaleById = async (id, organisationId) => {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      listing: {
        include: {
          scrapRecord: {
            include: { category: true }
          }
        }
      },
      buyer: true,
      seller: true,
      quotation: true,
      auction: true,
      acceptedByUser: { select: { id: true, contactName: true, email: true } },
      completedByUser: { select: { id: true, contactName: true, email: true } }
    }
  });

  if (!sale) throw notFoundError();
  if (sale.sellerId !== organisationId && sale.buyerId !== organisationId) {
    throw forbiddenError();
  }

  return sale;
};

/**
 * Industry updates delivery status on an auction-based sale.
 * Allowed: AWAITING_DISPATCH → IN_TRANSIT → DELIVERED
 */
export const updateDelivery = async (id, data, organisationId) => {
  const { deliveryStatus, expectedDelivery, deliveryNotes } = data;

  const saleModel = Prisma?.dmmf?.datamodel?.models?.find((m) => m.name === 'Sale');
  const supportsDeliveryStatus = saleModel?.fields?.some((f) => f.name === 'deliveryStatus');
  if (!supportsDeliveryStatus) {
    const err = new Error('Delivery tracking schema is not applied in the database. Please run npx prisma db push && npx prisma generate.');
    err.statusCode = 500;
    throw err;
  }

  const sale = await prisma.sale.findUnique({ where: { id } });
  if (!sale) throw notFoundError();
  if (sale.sellerId !== organisationId) throw forbiddenError('Only the seller can update delivery status');
  if (!sale.auctionId) {
    const err = new Error('Delivery tracking is only available for auction-based sales');
    err.statusCode = 400;
    throw err;
  }
  if (sale.status !== 'COMPLETED') {
    const err = new Error('Delivery can only be updated after payment is completed');
    err.statusCode = 400;
    throw err;
  }

  const TRANSITIONS = {
    AWAITING_DISPATCH: ['IN_TRANSIT'],
    IN_TRANSIT:        ['DELIVERED'],
    DELIVERED:         [],
  };
  const current = sale.deliveryStatus || 'AWAITING_DISPATCH';
  if (!TRANSITIONS[current]?.includes(deliveryStatus)) {
    const err = new Error(`Cannot transition delivery from ${current} to ${deliveryStatus}`);
    err.statusCode = 400;
    throw err;
  }

  const updateData = { deliveryStatus };
  if (expectedDelivery) updateData.expectedDelivery = new Date(expectedDelivery);
  if (deliveryNotes)    updateData.deliveryNotes    = deliveryNotes;
  if (deliveryStatus === 'DELIVERED') updateData.deliveredAt = new Date();

  return await prisma.sale.update({ where: { id }, data: updateData });
};

// Valid manual state transitions (via the status endpoint).
// PAYMENT_PROCESSING → COMPLETED is intentionally absent here:
// that transition is only allowed through the payment service
// (verifyPayment / handleWebhook) to prevent bypassing payment.
const SALE_TRANSITIONS = {
  ACCEPTED:           ['PENDING_PAYMENT', 'CANCELLED'],
  PENDING_PAYMENT:    ['CANCELLED'],
  PAYMENT_PROCESSING: ['CANCELLED'],
  COMPLETED:          [],
  CANCELLED:          [],
  REFUNDED:           []
};

/**
 * Update sale status via the manual status endpoint.
 * COMPLETED is intentionally excluded from SALE_TRANSITIONS — that
 * transition is owned exclusively by the payment service.
 */
export const updateSaleStatus = async (id, newStatus, _userId, organisationId) => {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      listing: {
        include: { scrapRecord: { include: { category: true } } }
      }
    }
  });

  if (!sale) throw notFoundError();
  if (sale.sellerId !== organisationId && sale.buyerId !== organisationId) {
    throw forbiddenError();
  }

  const allowed = SALE_TRANSITIONS[sale.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition sale from ${sale.status} to ${newStatus}`);
  }

  const updateData = { status: newStatus };
  if (newStatus === 'CANCELLED') updateData.cancelledAt = new Date();

  return await prisma.sale.update({
    where: { id },
    data: updateData,
    include: {
      listing: {
        include: { scrapRecord: { include: { category: true } } }
      },
      buyer:  { select: { id: true, companyName: true } },
      seller: { select: { id: true, companyName: true } }
    }
  });
};

/**
 * Seller confirms payment received → PENDING_PAYMENT → COMPLETED.
 * Deducts sold quantity from the scrap record and updates listing status.
 */
export const completeSale = async (id, organisationId, userId) => {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { listing: { include: { scrapRecord: true } } }
  });

  if (!sale) throw notFoundError();
  if (sale.sellerId !== organisationId) throw forbiddenError('Only the seller can complete a sale');
  if (sale.status !== 'PENDING_PAYMENT') {
    throw Object.assign(new Error(`Sale is ${sale.status} — only PENDING_PAYMENT sales can be completed`), { statusCode: 400 });
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Mark sale COMPLETED
    const completed = await tx.sale.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date(), completedByUserId: userId || null },
      include: {
        listing: { include: { scrapRecord: { include: { category: true } } } },
        buyer:  { select: { id: true, companyName: true } },
        seller: { select: { id: true, companyName: true } }
      }
    });

    const scrapId = sale.listing.scrapRecordId;
    const soldQty = Number(sale.quantityKg);

    // 2. Deduct from scrap record
    const scrap = await tx.scrapRecord.findUnique({ where: { id: scrapId } });
    const available  = Math.max(0, Number(scrap.availableQuantityKg)  - soldQty);
    const soldTotal  = Number(scrap.soldQuantityKg  || 0) + soldQty;
    const listed     = Math.max(0, Number(scrap.listedQuantityKg || 0) - soldQty);

    let newStatus = 'AVAILABLE';
    if (available <= 0 && listed <= 0) newStatus = 'SOLD_OUT';
    else if (listed > 0) newStatus = 'PARTIALLY_LISTED';

    await tx.scrapRecord.update({
      where: { id: scrapId },
      data: { availableQuantityKg: available, soldQuantityKg: soldTotal, listedQuantityKg: listed, status: newStatus, ownershipStatus: 'DEALER_OWNED' }
    });

    // 3. Update listing
    await tx.listing.update({
      where: { id: sale.listingId },
      data: { status: available <= 0 ? 'COMPLETED' : 'PUBLISHED' }
    });

    return completed;
  }).then(async (completed) => {
    // Notify buyer (fire-and-forget)
    try {
      const buyerUser = await prisma.user.findFirst({
        where: { organisationId: completed.buyerId, isActive: true },
      });
      if (buyerUser) {
        const materialName = completed.listing?.scrapRecord?.category?.name || completed.listing?.scrapRecord?.description || 'Scrap Material';
        await notifySaleCompleted(buyerUser.id, id, materialName, completed.totalValue);
      }
    } catch (e) {
      console.error('Sale completion notification error (non-fatal):', e.message);
    }
    return completed;
  });
};

