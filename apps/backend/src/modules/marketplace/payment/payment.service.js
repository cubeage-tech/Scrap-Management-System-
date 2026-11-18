import prisma, { Prisma } from '../../../core/lib/prisma.js';

// ── Error helpers ─────────────────────────────────────────────────────────────

const makeError = (msg, code = 400) => {
  const e = new Error(msg);
  e.statusCode = code;
  return e;
};

const notFoundError   = (msg = 'Record not found')   => makeError(msg, 404);
const forbiddenError  = (msg = 'Unauthorized')        => makeError(msg, 403);
const conflictError   = (msg)                         => makeError(msg, 409);

// ── Idempotency key ───────────────────────────────────────────────────────────

// Deterministic per-sale key: one Payment row per sale guaranteed by the
// DB @unique constraint on Payment.saleId AND Payment.idempotencyKey.
const idempotencyKey = (saleId) => `pay:${saleId}`;

// ── Internal: finalize sale after verified payment ────────────────────────────
// Always called inside an existing Prisma transaction (tx).
// Bypasses SALE_TRANSITIONS — only the payment layer may call this.

export const finalizeSaleAfterPayment = async (sale, tx) => {
  // Auction sales enter a delivery-pending state; quotation sales complete immediately
  const isAuctionSale = !!sale.auctionId;

  // Safely check if the currently loaded Prisma Client model definition includes deliveryStatus
  const saleModel = Prisma?.dmmf?.datamodel?.models?.find((m) => m.name === 'Sale');
  const supportsDeliveryStatus = saleModel?.fields?.some((f) => f.name === 'deliveryStatus');

  await tx.sale.update({
    where: { id: sale.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      ownershipTransferredAt: new Date(),
      ...(isAuctionSale && supportsDeliveryStatus && { deliveryStatus: 'AWAITING_DISPATCH' })
    }
  });

  await tx.listing.update({
    where: { id: sale.listingId },
    data: { status: 'COMPLETED', closedAt: new Date() }
  });

  const scrap = sale.listing?.scrapRecord;
  if (!scrap) return;

  // Create buyer's inventory — idempotent via @unique sourceSaleId
  const existing = await tx.scrapRecord.findUnique({ where: { sourceSaleId: sale.id } });
  if (!existing) {
    await tx.scrapRecord.create({
      data: {
        ownerId: sale.buyerId,
        categoryId: scrap.categoryId,
        description: `Purchased via Sale #${sale.id.slice(0, 8)} — ${scrap.description || 'Scrap Material'}`,
        condition: scrap.condition || 'USED',
        locationLabel: scrap.locationLabel,
        totalQuantityKg: sale.quantityKg,
        availableQuantityKg: sale.quantityKg,
        listedQuantityKg: 0,
        soldQuantityKg: 0,
        status: 'AVAILABLE',
        ownershipStatus: 'DEALER_OWNED',
        sourceSaleId: sale.id
      }
    });
  }

  // Seller's scrap: listed → sold; compute new status explicitly
  const qty = Number(sale.quantityKg);
  // Re-fetch inside transaction to get the current DB values (not snapshot)
  const currentScrap = await tx.scrapRecord.findUnique({ where: { id: scrap.id } });
  if (currentScrap) {
    const newListed = Math.max(0, Number(currentScrap.listedQuantityKg) - qty);
    const newSold   = Number(currentScrap.soldQuantityKg) + qty;
    const newAvail  = Number(currentScrap.availableQuantityKg);

    // If all quantity is now sold and nothing is left to list, mark SOLD_OUT
    let newScrapStatus = currentScrap.status;
    if (newAvail <= 0 && newListed <= 0) {
      newScrapStatus = 'SOLD_OUT';
    } else if (newAvail <= 0) {
      newScrapStatus = 'FULLY_LISTED';
    } else if (newListed > 0) {
      newScrapStatus = 'PARTIALLY_LISTED';
    } else {
      newScrapStatus = 'AVAILABLE';
    }

    await tx.scrapRecord.update({
      where: { id: scrap.id },
      data: {
        listedQuantityKg: newListed,
        soldQuantityKg:   newSold,
        status:           newScrapStatus
      }
    });
  }
};

// ── getSaleWithPaymentContext — shared fetch ──────────────────────────────────

const fetchSale = async (saleId) =>
  prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      listing: { include: { scrapRecord: true } },
      payment: true
    }
  });

// ── 1. Initiate payment ───────────────────────────────────────────────────────

export const initiatePayment = async (saleId, organisationId) => {
  const sale = await fetchSale(saleId);

  if (!sale) throw notFoundError('Sale not found');
  if (sale.buyerId !== organisationId) {
    throw forbiddenError('Only the buyer can initiate payment');
  }
  if (sale.status !== 'PENDING_PAYMENT') {
    throw makeError(`Cannot initiate payment: sale status is ${sale.status}`);
  }
  if (sale.paymentExpiresAt && sale.paymentExpiresAt <= new Date()) {
    throw makeError('Payment window has expired — contact the seller to reopen');
  }

  // Idempotency
  const existing = sale.payment;
  if (existing) {
    if (existing.status === 'SUCCESS') {
      throw conflictError('Payment already completed for this sale');
    }
    if (existing.status === 'PROCESSING') {
      return existing; // safe to return — buyer hit the endpoint twice
    }
    // FAILED or EXPIRED: allow retry
  }

  // Amount is server-authoritative — never trust the request body
  const amount = sale.totalValue;
  const key    = idempotencyKey(saleId);

  return await prisma.$transaction(async (tx) => {
    let payment;

    if (existing) {
      // Retry after FAILED/EXPIRED: reset to PROCESSING
      payment = await tx.payment.update({
        where: { saleId },
        data: {
          status: 'PROCESSING',
          amount,             // re-stamp server amount on retry
          processingAt: new Date(),
          failureReason: null,
          failedAt: null,
          expiredAt: null
        }
      });
    } else {
      payment = await tx.payment.create({
        data: {
          saleId,
          gateway: 'MANUAL',
          amount,
          currency: 'INR',
          status: 'PROCESSING',
          idempotencyKey: key,
          processingAt: new Date()
        }
      });
    }

    await tx.sale.update({
      where: { id: saleId },
      data: { status: 'PAYMENT_PROCESSING' }
    });

    return payment;
  });
};

// ── 2. Verify payment (MANUAL mode) ──────────────────────────────────────────

export const verifyPayment = async (saleId, paymentId, organisationId) => {
  const sale = await fetchSale(saleId);

  if (!sale) throw notFoundError('Sale not found');
  if (sale.buyerId !== organisationId) {
    throw forbiddenError('Only the buyer can verify payment');
  }

  const payment = sale.payment;
  if (!payment) throw notFoundError('No payment record found for this sale — initiate first');
  if (payment.id !== paymentId) {
    throw makeError('paymentId does not match this sale');
  }

  // Idempotency: already succeeded
  if (payment.status === 'SUCCESS') {
    return { alreadyCompleted: true, payment };
  }

  if (payment.status !== 'PROCESSING') {
    throw makeError(`Cannot verify payment: payment status is ${payment.status}`);
  }
  if (sale.status !== 'PAYMENT_PROCESSING') {
    throw makeError(`Cannot verify payment: sale status is ${sale.status}`);
  }

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: { status: 'SUCCESS', paidAt: new Date() }
    });

    await finalizeSaleAfterPayment(sale, tx);

    return { alreadyCompleted: false, payment: updated };
  });
};

// ── 3. Webhook / gateway callback ────────────────────────────────────────────

export const handleWebhook = async (payload) => {
  const { saleId, paymentId, status, gatewayPaymentId, gatewayOrderId, failureReason } = payload;

  if (!saleId || !paymentId || !status) {
    throw makeError('Webhook payload must include saleId, paymentId, status');
  }

  // Idempotency guard 1: gatewayPaymentId already stored → already processed
  if (gatewayPaymentId) {
    const byGateway = await prisma.payment.findUnique({ where: { gatewayPaymentId } });
    if (byGateway?.status === 'SUCCESS') {
      return { alreadyProcessed: true, payment: byGateway };
    }
  }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw notFoundError('Payment not found');
  if (payment.saleId !== saleId) throw makeError('Payment does not belong to this sale');

  // Idempotency guard 2: already SUCCESS
  if (payment.status === 'SUCCESS') return { alreadyProcessed: true, payment };

  const sale = await fetchSale(saleId);
  if (!sale) throw notFoundError('Sale not found');

  if (status === 'SUCCESS') {
    if (payment.status !== 'PROCESSING') {
      throw makeError(`Cannot complete payment from status ${payment.status}`);
    }
    if (sale.status !== 'PAYMENT_PROCESSING') {
      throw makeError(`Cannot complete sale from status ${sale.status}`);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCESS',
          paidAt: new Date(),
          ...(gatewayPaymentId && { gatewayPaymentId }),
          ...(gatewayOrderId && { gatewayOrderId })
        }
      });

      await finalizeSaleAfterPayment(sale, tx);

      return { alreadyProcessed: false, payment: updated };
    });
  }

  if (status === 'FAILED') {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          failureReason: failureReason || 'Payment declined by gateway',
          ...(gatewayPaymentId && { gatewayPaymentId })
        }
      });
      // Sale stays at PAYMENT_PROCESSING — buyer may retry via /initiate
      return { alreadyProcessed: false, payment: updated };
    });
  }

  throw makeError(`Unknown webhook status: ${status}`);
};

// ── 4. Get payment by saleId ──────────────────────────────────────────────────

export const getPaymentBySaleId = async (saleId, organisationId) => {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { payment: true }
  });

  if (!sale) throw notFoundError('Sale not found');
  if (sale.buyerId !== organisationId && sale.sellerId !== organisationId) {
    throw forbiddenError();
  }

  return sale.payment;
};

// ── 5. Refund ─────────────────────────────────────────────────────────────────

export const refundPayment = async (paymentId, organisationId, role) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { sale: { include: { listing: { include: { scrapRecord: true } } } } }
  });

  if (!payment) throw notFoundError('Payment not found');

  const sale = payment.sale;
  if (!sale) throw notFoundError('Associated sale not found');

  if (role !== 'SUPER_ADMIN' && sale.sellerId !== organisationId) {
    throw forbiddenError('Only the seller or SUPER_ADMIN can process a refund');
  }
  if (payment.status !== 'SUCCESS') {
    throw makeError(`Cannot refund: payment status is ${payment.status}`);
  }
  if (sale.status !== 'COMPLETED') {
    throw makeError(`Cannot refund: sale status is ${sale.status}`);
  }

  return await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED', refundedAt: new Date() }
    });

    await tx.sale.update({
      where: { id: sale.id },
      data: { status: 'REFUNDED' }
    });

    // Reverse buyer inventory — mark unavailable (soft, preserves audit trail)
    const buyerInventory = await tx.scrapRecord.findUnique({ where: { sourceSaleId: sale.id } });
    if (buyerInventory) {
      await tx.scrapRecord.update({
        where: { id: buyerInventory.id },
        data: { status: 'SOLD_OUT', ownershipStatus: 'INDUSTRY_OWNED', availableQuantityKg: 0 }
      });
    }

    // Reverse seller's quantity accounting
    const scrap = sale.listing?.scrapRecord;
    if (scrap) {
      const qty = Number(sale.quantityKg);
      await tx.scrapRecord.update({
        where: { id: scrap.id },
        data: {
          ownershipStatus: 'INDUSTRY_OWNED',
          soldQuantityKg:      { decrement: qty },
          availableQuantityKg: { increment: qty }
        }
      });
    }

    return { saleId: sale.id, paymentId, status: 'REFUNDED' };
  });
};
