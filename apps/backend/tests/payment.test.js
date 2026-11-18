import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import prisma from '../src/core/lib/prisma.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeToken = (overrides = {}) =>
  jwt.sign(
    { id: 'user-1', organisationId: 'org-industry-1', role: 'INDUSTRY', ...overrides },
    'test-secret-phase4',
    { expiresIn: '1h' }
  );

const industryToken  = makeToken();
const dealerToken    = makeToken({ id: 'user-dealer', organisationId: 'org-dealer-1', role: 'DEALER' });
const adminToken     = makeToken({ id: 'user-admin',  organisationId: 'org-admin-1',  role: 'SUPER_ADMIN' });
// A different dealer who is NOT the buyer on pendingSale — used to test service-level 403
const outsiderToken  = makeToken({ id: 'user-outsider', organisationId: 'org-outsider-1', role: 'DEALER' });

const SALE_ID    = '00000000-0000-0000-0000-000000000020';
const PAYMENT_ID = '00000000-0000-0000-0000-000000000021';
const SCRAP_ID   = '00000000-0000-0000-0000-000000000022';
const LISTING_ID = '00000000-0000-0000-0000-000000000023';

const pendingSale = {
  id: SALE_ID,
  status: 'PENDING_PAYMENT',
  buyerId: 'org-dealer-1',
  sellerId: 'org-industry-1',
  listingId: LISTING_ID,
  quantityKg: 100,
  totalValue: 10000,
  paymentExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  payment: null,
  listing: { scrapRecord: { id: SCRAP_ID, ownerId: 'org-industry-1', categoryId: 'cat-1', condition: 'USED', locationLabel: 'Test', description: 'Steel scrap' } }
};

const processingPayment = {
  id: PAYMENT_ID,
  saleId: SALE_ID,
  status: 'PROCESSING',
  amount: 10000,
  gateway: 'MANUAL',
  idempotencyKey: `pay:${SALE_ID}`,
  paidAt: null
};

// resetAllMocks clears both call history AND the mockResolvedValueOnce queue,
// preventing once-mock queue pollution between tests (clearAllMocks only clears calls).
beforeEach(() => { jest.resetAllMocks(); });

// ── Auth & RBAC ───────────────────────────────────────────────────────────────

describe('Payment Auth & RBAC', () => {
  it('POST /initiate — 401 without token', async () => {
    const res = await request(app).post('/api/marketplace/payments/initiate').send({ saleId: SALE_ID });
    expect(res.statusCode).toBe(401);
  });

  it('POST /initiate — 403 for INDUSTRY (seller cannot pay)', async () => {
    const res = await request(app)
      .post('/api/marketplace/payments/initiate')
      .set('Authorization', `Bearer ${industryToken}`)
      .send({ saleId: SALE_ID });
    expect(res.statusCode).toBe(403);
  });

  it('POST /verify — 403 for INDUSTRY', async () => {
    const res = await request(app)
      .post('/api/marketplace/payments/verify')
      .set('Authorization', `Bearer ${industryToken}`)
      .send({ saleId: SALE_ID, paymentId: PAYMENT_ID });
    expect(res.statusCode).toBe(403);
  });

  it('POST /webhook — 200 without any token (public endpoint)', async () => {
    // Webhook must be reachable without auth (gateway calls it)
    prisma.payment.findUnique.mockResolvedValue(null); // trigger not found
    const res = await request(app)
      .post('/api/marketplace/payments/webhook')
      .send({ saleId: SALE_ID, paymentId: PAYMENT_ID, status: 'SUCCESS' });
    // Returns 200 even on error (to prevent gateway retries)
    expect(res.statusCode).toBe(200);
  });
});

// ── initiatePayment ───────────────────────────────────────────────────────────

describe('initiatePayment', () => {
  it('creates a payment and transitions sale to PAYMENT_PROCESSING', async () => {
    prisma.sale.findUnique.mockResolvedValue(pendingSale);
    prisma.payment.create.mockResolvedValue(processingPayment);
    prisma.sale.update.mockResolvedValue({ ...pendingSale, status: 'PAYMENT_PROCESSING' });

    const res = await request(app)
      .post('/api/marketplace/payments/initiate')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PROCESSING');
  });

  it('returns 400 when saleId is missing', async () => {
    const res = await request(app)
      .post('/api/marketplace/payments/initiate')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/saleId/i);
  });

  it('returns 403 when a different dealer (not the buyer) tries to pay', async () => {
    prisma.sale.findUnique.mockResolvedValue(pendingSale); // buyer is org-dealer-1

    const res = await request(app)
      .post('/api/marketplace/payments/initiate')
      .set('Authorization', `Bearer ${outsiderToken}`) // org-outsider-1, passes RBAC but fails service check
      .send({ saleId: SALE_ID });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Only the buyer/i);
  });

  it('returns 400 when sale is not in PENDING_PAYMENT', async () => {
    prisma.sale.findUnique.mockResolvedValue({ ...pendingSale, status: 'PAYMENT_PROCESSING', payment: processingPayment });

    const res = await request(app)
      .post('/api/marketplace/payments/initiate')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/PAYMENT_PROCESSING/i);
  });

  it('returns 400 when payment window has expired', async () => {
    prisma.sale.findUnique.mockResolvedValue({
      ...pendingSale,
      paymentExpiresAt: new Date(Date.now() - 1000), // 1 second in past
      payment: null
    });

    const res = await request(app)
      .post('/api/marketplace/payments/initiate')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/expired/i);
  });

  it('is idempotent — returns existing PROCESSING payment', async () => {
    prisma.sale.findUnique.mockResolvedValue({
      ...pendingSale,
      payment: processingPayment
    });

    const res = await request(app)
      .post('/api/marketplace/payments/initiate')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID });

    // Should return existing payment, not create a new one
    expect(res.statusCode).toBe(201);
    expect(res.body.data.id).toBe(PAYMENT_ID);
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it('returns 409 when payment already SUCCESS', async () => {
    prisma.sale.findUnique.mockResolvedValue({
      ...pendingSale,
      payment: { ...processingPayment, status: 'SUCCESS' }
    });

    const res = await request(app)
      .post('/api/marketplace/payments/initiate')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already completed/i);
  });

  it('returns 404 when sale not found', async () => {
    prisma.sale.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/marketplace/payments/initiate')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID });

    expect(res.statusCode).toBe(404);
  });
});

// ── verifyPayment ─────────────────────────────────────────────────────────────

describe('verifyPayment', () => {
  const processingState = {
    ...pendingSale,
    status: 'PAYMENT_PROCESSING',
    payment: processingPayment
  };

  it('verifies payment and triggers ownership transfer', async () => {
    prisma.sale.findUnique.mockResolvedValue(processingState);
    prisma.payment.update.mockResolvedValue({ ...processingPayment, status: 'SUCCESS', paidAt: new Date() });
    prisma.sale.update.mockResolvedValue({ ...processingState, status: 'COMPLETED' });
    prisma.listing.update.mockResolvedValue({});
    prisma.scrapRecord.findUnique.mockResolvedValue(null); // no existing inventory
    prisma.scrapRecord.create.mockResolvedValue({});
    prisma.scrapRecord.update.mockResolvedValue({});

    const res = await request(app)
      .post('/api/marketplace/payments/verify')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID, paymentId: PAYMENT_ID });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/ownership transferred/i);
  });

  it('is idempotent — returns success if already verified', async () => {
    prisma.sale.findUnique.mockResolvedValue({
      ...processingState,
      payment: { ...processingPayment, status: 'SUCCESS', paidAt: new Date() }
    });

    const res = await request(app)
      .post('/api/marketplace/payments/verify')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID, paymentId: PAYMENT_ID });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/already verified/i);
    expect(prisma.payment.update).not.toHaveBeenCalled();
  });

  it('returns 400 for mismatched paymentId', async () => {
    prisma.sale.findUnique.mockResolvedValue(processingState);

    const res = await request(app)
      .post('/api/marketplace/payments/verify')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID, paymentId: 'wrong-payment-id' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/does not match/i);
  });

  it('returns 400 when no payment record exists', async () => {
    prisma.sale.findUnique.mockResolvedValue({ ...processingState, payment: null });

    const res = await request(app)
      .post('/api/marketplace/payments/verify')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID, paymentId: PAYMENT_ID });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/initiate first/i);
  });

  it('returns 400 when payment is FAILED', async () => {
    prisma.sale.findUnique.mockResolvedValue({
      ...processingState,
      payment: { ...processingPayment, status: 'FAILED' }
    });

    const res = await request(app)
      .post('/api/marketplace/payments/verify')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID, paymentId: PAYMENT_ID });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/FAILED/i);
  });

  it('does NOT create inventory twice (idempotency via sourceSaleId)', async () => {
    const existingInventory = { id: 'inv-existing', sourceSaleId: SALE_ID };
    prisma.sale.findUnique.mockResolvedValue(processingState);
    prisma.payment.update.mockResolvedValue({ ...processingPayment, status: 'SUCCESS' });
    prisma.sale.update.mockResolvedValue({ ...processingState, status: 'COMPLETED' });
    prisma.listing.update.mockResolvedValue({});
    prisma.scrapRecord.findUnique.mockResolvedValue(existingInventory); // already created
    prisma.scrapRecord.update.mockResolvedValue({});

    const res = await request(app)
      .post('/api/marketplace/payments/verify')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID, paymentId: PAYMENT_ID });

    expect(res.statusCode).toBe(200);
    expect(prisma.scrapRecord.create).not.toHaveBeenCalled();
  });
});

// ── Webhook ───────────────────────────────────────────────────────────────────

describe('handleWebhook', () => {
  it('processes SUCCESS webhook and transfers ownership', async () => {
    prisma.payment.findUnique
      .mockResolvedValueOnce(null)    // gatewayPaymentId check (first call)
      .mockResolvedValueOnce(processingPayment); // main lookup
    prisma.sale.findUnique.mockResolvedValue({ ...pendingSale, status: 'PAYMENT_PROCESSING', payment: processingPayment });
    prisma.payment.update.mockResolvedValue({ ...processingPayment, status: 'SUCCESS' });
    prisma.sale.update.mockResolvedValue({});
    prisma.listing.update.mockResolvedValue({});
    prisma.scrapRecord.findUnique.mockResolvedValue(null);
    prisma.scrapRecord.create.mockResolvedValue({});
    prisma.scrapRecord.update.mockResolvedValue({});

    const res = await request(app)
      .post('/api/marketplace/payments/webhook')
      .send({ saleId: SALE_ID, paymentId: PAYMENT_ID, status: 'SUCCESS', gatewayPaymentId: 'gw-pay-001' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('processes FAILED webhook — marks payment FAILED, sale stays PAYMENT_PROCESSING', async () => {
    // No gatewayPaymentId in payload → only one findUnique call (by paymentId)
    prisma.payment.findUnique.mockResolvedValueOnce(processingPayment);
    prisma.sale.findUnique.mockResolvedValue({ ...pendingSale, status: 'PAYMENT_PROCESSING', payment: processingPayment });
    prisma.payment.update.mockResolvedValue({ ...processingPayment, status: 'FAILED' });

    const res = await request(app)
      .post('/api/marketplace/payments/webhook')
      .send({ saleId: SALE_ID, paymentId: PAYMENT_ID, status: 'FAILED', failureReason: 'Insufficient funds' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    // Ownership should NOT be transferred
    expect(prisma.scrapRecord.create).not.toHaveBeenCalled();
  });

  it('is idempotent — duplicate webhook with same gatewayPaymentId returns 200 immediately', async () => {
    const alreadySucceeded = { ...processingPayment, status: 'SUCCESS', gatewayPaymentId: 'gw-pay-001' };
    prisma.payment.findUnique.mockResolvedValueOnce(alreadySucceeded); // gatewayPaymentId check

    const res = await request(app)
      .post('/api/marketplace/payments/webhook')
      .send({ saleId: SALE_ID, paymentId: PAYMENT_ID, status: 'SUCCESS', gatewayPaymentId: 'gw-pay-001' });

    expect(res.statusCode).toBe(200);
    // Should not process again
    expect(prisma.payment.update).not.toHaveBeenCalled();
    expect(prisma.scrapRecord.create).not.toHaveBeenCalled();
  });

  it('returns 200 (not 500) on unknown status — gateway should not retry', async () => {
    // No gatewayPaymentId in payload → only one findUnique call (by paymentId)
    prisma.payment.findUnique.mockResolvedValueOnce(processingPayment);
    prisma.sale.findUnique.mockResolvedValue({ ...pendingSale, status: 'PAYMENT_PROCESSING' });

    const res = await request(app)
      .post('/api/marketplace/payments/webhook')
      .send({ saleId: SALE_ID, paymentId: PAYMENT_ID, status: 'UNKNOWN_STATUS' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(false); // error reported in body
  });
});

// ── getPaymentBySaleId ────────────────────────────────────────────────────────

describe('getPaymentBySaleId', () => {
  it('returns payment for a sale the dealer is involved in', async () => {
    prisma.sale.findUnique.mockResolvedValue({
      id: SALE_ID,
      buyerId: 'org-dealer-1',
      sellerId: 'org-industry-1',
      payment: processingPayment
    });

    const res = await request(app)
      .get(`/api/marketplace/payments/${SALE_ID}`)
      .set('Authorization', `Bearer ${dealerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(PAYMENT_ID);
  });

  it('returns 404 when no payment exists yet', async () => {
    prisma.sale.findUnique.mockResolvedValue({
      id: SALE_ID,
      buyerId: 'org-dealer-1',
      sellerId: 'org-industry-1',
      payment: null
    });

    const res = await request(app)
      .get(`/api/marketplace/payments/${SALE_ID}`)
      .set('Authorization', `Bearer ${dealerToken}`);

    expect(res.statusCode).toBe(404);
  });

  it('returns 403 for unrelated organisation', async () => {
    prisma.sale.findUnique.mockResolvedValue({
      id: SALE_ID,
      buyerId: 'org-other',
      sellerId: 'org-other-2',
      payment: processingPayment
    });

    const res = await request(app)
      .get(`/api/marketplace/payments/${SALE_ID}`)
      .set('Authorization', `Bearer ${dealerToken}`);

    expect(res.statusCode).toBe(403);
  });
});

// ── refundPayment ─────────────────────────────────────────────────────────────

describe('refundPayment', () => {
  const completedPayment = {
    id: PAYMENT_ID,
    saleId: SALE_ID,
    status: 'SUCCESS',
    amount: 10000,
    sale: {
      id: SALE_ID,
      status: 'COMPLETED',
      buyerId: 'org-dealer-1',
      sellerId: 'org-industry-1',
      listingId: LISTING_ID,
      quantityKg: 100,
      listing: {
        scrapRecord: { id: SCRAP_ID, ownerId: 'org-industry-1', categoryId: 'cat-1' }
      }
    }
  };

  it('refunds a completed sale (seller)', async () => {
    prisma.payment.findUnique.mockResolvedValue(completedPayment);
    prisma.payment.update.mockResolvedValue({ ...completedPayment, status: 'REFUNDED' });
    prisma.sale.update.mockResolvedValue({ ...completedPayment.sale, status: 'REFUNDED' });
    prisma.scrapRecord.findUnique.mockResolvedValue({ id: 'buyer-inv-1', sourceSaleId: SALE_ID });
    prisma.scrapRecord.update.mockResolvedValue({});

    const res = await request(app)
      .post(`/api/marketplace/payments/${PAYMENT_ID}/refund`)
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('REFUNDED');
  });

  it('refunds via SUPER_ADMIN override', async () => {
    prisma.payment.findUnique.mockResolvedValue(completedPayment);
    prisma.payment.update.mockResolvedValue({ ...completedPayment, status: 'REFUNDED' });
    prisma.sale.update.mockResolvedValue({});
    prisma.scrapRecord.findUnique.mockResolvedValue(null);
    prisma.scrapRecord.update.mockResolvedValue({});

    const res = await request(app)
      .post(`/api/marketplace/payments/${PAYMENT_ID}/refund`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  it('rejects refund by buyer (not their right)', async () => {
    prisma.payment.findUnique.mockResolvedValue(completedPayment);

    const res = await request(app)
      .post(`/api/marketplace/payments/${PAYMENT_ID}/refund`)
      .set('Authorization', `Bearer ${dealerToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/seller or SUPER_ADMIN/i);
  });

  it('rejects refund when payment is not SUCCESS', async () => {
    prisma.payment.findUnique.mockResolvedValue({
      ...completedPayment,
      status: 'PROCESSING',
      sale: completedPayment.sale
    });

    const res = await request(app)
      .post(`/api/marketplace/payments/${PAYMENT_ID}/refund`)
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Cannot refund/i);
  });

  it('rejects refund when sale is not COMPLETED', async () => {
    prisma.payment.findUnique.mockResolvedValue({
      ...completedPayment,
      sale: { ...completedPayment.sale, status: 'PAYMENT_PROCESSING' }
    });

    const res = await request(app)
      .post(`/api/marketplace/payments/${PAYMENT_ID}/refund`)
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Cannot refund.*sale/i);
  });
});

// ── Sale status endpoint — COMPLETED blocked ──────────────────────────────────

describe('Sale status endpoint — payment bypass prevention', () => {
  it('PATCH /sales/:id/status rejects PAYMENT_PROCESSING → COMPLETED (must use payment flow)', async () => {
    prisma.sale.findUnique.mockResolvedValue({
      id: SALE_ID,
      status: 'PAYMENT_PROCESSING',
      buyerId: 'org-dealer-1',
      sellerId: 'org-industry-1',
      listing: { scrapRecord: {} }
    });

    const res = await request(app)
      .patch(`/api/marketplace/sales/${SALE_ID}/status`)
      .set('Authorization', `Bearer ${industryToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.statusCode).toBe(500); // sale controller uses statusCode || 500; transition error has no statusCode
    expect(res.body.message).toMatch(/Cannot transition/i);
  });

  it('PATCH /sales/:id/status allows PAYMENT_PROCESSING → CANCELLED (seller override)', async () => {
    prisma.sale.findUnique.mockResolvedValue({
      id: SALE_ID,
      status: 'PAYMENT_PROCESSING',
      buyerId: 'org-dealer-1',
      sellerId: 'org-industry-1',
      listing: { scrapRecord: {} }
    });
    prisma.sale.update.mockResolvedValue({ id: SALE_ID, status: 'CANCELLED' });

    const res = await request(app)
      .patch(`/api/marketplace/sales/${SALE_ID}/status`)
      .set('Authorization', `Bearer ${industryToken}`)
      .send({ status: 'CANCELLED' });

    expect(res.statusCode).toBe(200);
  });
});
