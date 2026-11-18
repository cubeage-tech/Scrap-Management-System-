/**
 * Phase 6: Ownership Transfer & Dealer Inventory
 *
 * Tests the complete flow:
 *   WINNER_SELECTED → PAYMENT_VERIFIED → OWNERSHIP_TRANSFER → DEALER_INVENTORY → DEALER_RESALE
 *
 * Covers:
 *   - Ownership transfer creates correct dealer ScrapRecord
 *   - Source traceability via sourceSaleId
 *   - Quantity updates: seller listedQty→soldQty, status→SOLD_OUT
 *   - Idempotency: no duplicate inventory records
 *   - Resale guards: SOLD_OUT, TRANSFER_PENDING, non-owner
 *   - Negative quantity prevention
 *   - Listing cancellation restores scrap status
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import prisma from '../src/core/lib/prisma.js';
import { finalizeSaleAfterPayment } from '../src/modules/marketplace/payment/payment.service.js';
import { createListingService } from '../src/modules/marketplace/listings/listing.service.js';

// ── Tokens ────────────────────────────────────────────────────────────────────

const makeToken = (overrides = {}) =>
  jwt.sign(
    { id: 'user-1', organisationId: 'org-industry-1', role: 'INDUSTRY', ...overrides },
    'test-secret-phase4',
    { expiresIn: '1h' }
  );

const industryToken = makeToken();
const dealerToken   = makeToken({ id: 'user-dealer', organisationId: 'org-dealer-1', role: 'DEALER' });

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SALE_ID    = '00000000-0000-0000-0000-000000000030';
const SCRAP_ID   = '00000000-0000-0000-0000-000000000031';
const LISTING_ID = '00000000-0000-0000-0000-000000000032';
const PAYMENT_ID = '00000000-0000-0000-0000-000000000033';
const CAT_ID     = '00000000-0000-0000-0000-000000000034';
const USER_ID    = '00000000-0000-0000-0000-000000000035';

const sellerScrap = {
  id: SCRAP_ID,
  ownerId: 'org-industry-1',
  categoryId: CAT_ID,
  description: 'Steel offcuts',
  condition: 'USED',
  locationLabel: 'Mumbai',
  totalQuantityKg: '500',
  listedQuantityKg: '100',
  soldQuantityKg: '0',
  availableQuantityKg: '400',
  status: 'PARTIALLY_LISTED',
  ownershipStatus: 'INDUSTRY_OWNED'
};

const completedSale = {
  id: SALE_ID,
  listingId: LISTING_ID,
  buyerId: 'org-dealer-1',
  sellerId: 'org-industry-1',
  quantityKg: '100',
  totalValue: 10000,
  status: 'PAYMENT_PROCESSING',
  listing: {
    id: LISTING_ID,
    scrapRecord: sellerScrap
  }
};

beforeEach(() => { jest.resetAllMocks(); });

// ── finalizeSaleAfterPayment — unit tests ─────────────────────────────────────

describe('finalizeSaleAfterPayment — ownership transfer', () => {
  it('creates dealer inventory with correct ownership fields', async () => {
    // sale.status → COMPLETED
    prisma.sale.update.mockResolvedValue({});
    // listing.status → COMPLETED
    prisma.listing.update.mockResolvedValue({});
    // No existing buyer inventory
    prisma.scrapRecord.findUnique
      .mockResolvedValueOnce(null)       // sourceSaleId lookup → not found
      .mockResolvedValueOnce(sellerScrap); // seller scrap re-fetch
    prisma.scrapRecord.create.mockResolvedValue({
      id: 'dealer-inv-1',
      ownerId: 'org-dealer-1',
      sourceSaleId: SALE_ID,
      ownershipStatus: 'DEALER_OWNED'
    });
    prisma.scrapRecord.update.mockResolvedValue({});

    await finalizeSaleAfterPayment(completedSale, prisma);

    expect(prisma.scrapRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ownerId: 'org-dealer-1',
          sourceSaleId: SALE_ID,
          ownershipStatus: 'DEALER_OWNED',
          totalQuantityKg: '100',
          availableQuantityKg: '100',
          soldQuantityKg: 0,
          listedQuantityKg: 0,
          status: 'AVAILABLE'
        })
      })
    );
  });

  it('marks seller scrap as SOLD_OUT when all quantity sold', async () => {
    const fullySoldSale = {
      ...completedSale,
      listing: {
        id: LISTING_ID,
        scrapRecord: {
          ...sellerScrap,
          listedQuantityKg: '100',
          availableQuantityKg: '0', // nothing left
          soldQuantityKg: '0'
        }
      }
    };

    prisma.sale.update.mockResolvedValue({});
    prisma.listing.update.mockResolvedValue({});
    prisma.scrapRecord.findUnique
      .mockResolvedValueOnce(null)  // no existing buyer inventory
      .mockResolvedValueOnce({      // seller scrap re-fetch
        id: SCRAP_ID,
        listedQuantityKg: '100',
        soldQuantityKg: '0',
        availableQuantityKg: '0',
        status: 'FULLY_LISTED'
      });
    prisma.scrapRecord.create.mockResolvedValue({});
    prisma.scrapRecord.update.mockResolvedValue({});

    await finalizeSaleAfterPayment(fullySoldSale, prisma);

    expect(prisma.scrapRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SOLD_OUT' })
      })
    );
  });

  it('keeps seller scrap as PARTIALLY_LISTED when other active listings remain', async () => {
    // Sale is for 50 kg; seller still has another 50 kg listed elsewhere (listedQty=100)
    const partialSale = {
      ...completedSale,
      quantityKg: '50',
      listing: {
        id: LISTING_ID,
        scrapRecord: {
          ...sellerScrap,
          listedQuantityKg: '100', // two concurrent listings of 50 kg each
          availableQuantityKg: '200',
          soldQuantityKg: '0'
        }
      }
    };

    prisma.sale.update.mockResolvedValue({});
    prisma.listing.update.mockResolvedValue({});
    prisma.scrapRecord.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: SCRAP_ID,
        listedQuantityKg: '100', // 100 listed; this sale removes 50, leaving 50 still listed
        soldQuantityKg: '0',
        availableQuantityKg: '200',
        status: 'PARTIALLY_LISTED'
      });
    prisma.scrapRecord.create.mockResolvedValue({});
    prisma.scrapRecord.update.mockResolvedValue({});

    await finalizeSaleAfterPayment(partialSale, prisma);

    expect(prisma.scrapRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        // newListed = max(0, 100 - 50) = 50 → still has listed qty → PARTIALLY_LISTED
        data: expect.objectContaining({ status: 'PARTIALLY_LISTED', listedQuantityKg: 50 })
      })
    );
  });

  it('does NOT create buyer inventory twice (idempotency guard)', async () => {
    prisma.sale.update.mockResolvedValue({});
    prisma.listing.update.mockResolvedValue({});
    // Existing buyer inventory already present
    prisma.scrapRecord.findUnique
      .mockResolvedValueOnce({ id: 'dealer-inv-existing', sourceSaleId: SALE_ID })
      .mockResolvedValueOnce(sellerScrap);
    prisma.scrapRecord.update.mockResolvedValue({});

    await finalizeSaleAfterPayment(completedSale, prisma);

    expect(prisma.scrapRecord.create).not.toHaveBeenCalled();
  });

  it('includes full traceability chain: sourceSaleId links back to sale', async () => {
    prisma.sale.update.mockResolvedValue({});
    prisma.listing.update.mockResolvedValue({});
    prisma.scrapRecord.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(sellerScrap);
    prisma.scrapRecord.create.mockResolvedValue({});
    prisma.scrapRecord.update.mockResolvedValue({});

    await finalizeSaleAfterPayment(completedSale, prisma);

    const createCall = prisma.scrapRecord.create.mock.calls[0][0];
    expect(createCall.data.sourceSaleId).toBe(SALE_ID);
    // Description embeds the sale reference
    expect(createCall.data.description).toContain(SALE_ID.slice(0, 8));
  });
});

// ── createListingService — resale guard tests ─────────────────────────────────

describe('createListingService — dealer resale guards', () => {
  const dealerScrap = {
    id: 'dealer-scrap-1',
    ownerId: 'org-dealer-1',
    categoryId: CAT_ID,
    description: 'Purchased steel',
    condition: 'USED',
    locationLabel: 'Mumbai',
    totalQuantityKg: '100',
    listedQuantityKg: '0',
    soldQuantityKg: '0',
    availableQuantityKg: '100',
    status: 'AVAILABLE',
    ownershipStatus: 'DEALER_OWNED'
  };

  it('allows dealer to list their own purchased inventory', async () => {
    prisma.scrapRecord.findUnique.mockResolvedValue(dealerScrap);
    prisma.user.findUnique.mockResolvedValue({ organisationId: 'org-dealer-1' });
    prisma.listing.create.mockResolvedValue({ id: 'listing-new', scrapRecord: dealerScrap });
    prisma.scrapRecord.update.mockResolvedValue({});

    const result = await createListingService({
      scrapRecordId: 'dealer-scrap-1',
      sellingMode: 'QUOTATION',
      quantityKg: 50,
      createdByUserId: USER_ID
    });

    expect(result.id).toBe('listing-new');
  });

  it('rejects listing creation when scrap is SOLD_OUT', async () => {
    prisma.scrapRecord.findUnique.mockResolvedValue({
      ...dealerScrap,
      status: 'SOLD_OUT',
      availableQuantityKg: '0'
    });
    prisma.user.findUnique.mockResolvedValue({ organisationId: 'org-dealer-1' });

    await expect(
      createListingService({
        scrapRecordId: 'dealer-scrap-1',
        sellingMode: 'QUOTATION',
        quantityKg: 10,
        createdByUserId: USER_ID
      })
    ).rejects.toThrow('sold-out');
  });

  it('rejects listing creation when ownership transfer is pending', async () => {
    prisma.scrapRecord.findUnique.mockResolvedValue({
      ...dealerScrap,
      ownershipStatus: 'TRANSFER_PENDING'
    });
    prisma.user.findUnique.mockResolvedValue({ organisationId: 'org-dealer-1' });

    await expect(
      createListingService({
        scrapRecordId: 'dealer-scrap-1',
        sellingMode: 'QUOTATION',
        quantityKg: 10,
        createdByUserId: USER_ID
      })
    ).rejects.toThrow('pending ownership transfer');
  });

  it('rejects listing for scrap owned by another organisation', async () => {
    prisma.scrapRecord.findUnique.mockResolvedValue({
      ...dealerScrap,
      ownerId: 'org-other-dealer'
    });
    prisma.user.findUnique.mockResolvedValue({ organisationId: 'org-dealer-1' });

    await expect(
      createListingService({
        scrapRecordId: 'dealer-scrap-1',
        sellingMode: 'QUOTATION',
        quantityKg: 10,
        createdByUserId: USER_ID
      })
    ).rejects.toThrow('owned by another organisation');
  });

  it('rejects listing quantity exceeding available stock (prevents negative)', async () => {
    prisma.scrapRecord.findUnique.mockResolvedValue({
      ...dealerScrap,
      availableQuantityKg: '30'
    });
    prisma.user.findUnique.mockResolvedValue({ organisationId: 'org-dealer-1' });

    await expect(
      createListingService({
        scrapRecordId: 'dealer-scrap-1',
        sellingMode: 'QUOTATION',
        quantityKg: 50, // exceeds available 30
        createdByUserId: USER_ID
      })
    ).rejects.toThrow('available quantity');
  });

  it('sets scrap status to FULLY_LISTED when all available quantity is listed', async () => {
    prisma.scrapRecord.findUnique.mockResolvedValue({
      ...dealerScrap,
      availableQuantityKg: '100',
      listedQuantityKg: '0'
    });
    prisma.user.findUnique.mockResolvedValue({ organisationId: 'org-dealer-1' });
    prisma.listing.create.mockResolvedValue({ id: 'listing-full', scrapRecord: dealerScrap });
    prisma.scrapRecord.update.mockResolvedValue({});

    await createListingService({
      scrapRecordId: 'dealer-scrap-1',
      sellingMode: 'QUOTATION',
      quantityKg: 100, // all available
      createdByUserId: USER_ID
    });

    expect(prisma.scrapRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FULLY_LISTED', availableQuantityKg: 0 })
      })
    );
  });

  it('sets scrap status to PARTIALLY_LISTED when partial quantity is listed', async () => {
    prisma.scrapRecord.findUnique.mockResolvedValue({
      ...dealerScrap,
      availableQuantityKg: '100',
      listedQuantityKg: '0'
    });
    prisma.user.findUnique.mockResolvedValue({ organisationId: 'org-dealer-1' });
    prisma.listing.create.mockResolvedValue({ id: 'listing-partial', scrapRecord: dealerScrap });
    prisma.scrapRecord.update.mockResolvedValue({});

    await createListingService({
      scrapRecordId: 'dealer-scrap-1',
      sellingMode: 'QUOTATION',
      quantityKg: 40, // partial
      createdByUserId: USER_ID
    });

    expect(prisma.scrapRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PARTIALLY_LISTED', availableQuantityKg: 60 })
      })
    );
  });
});

// ── Listing cancellation — scrap status restoration ───────────────────────────

describe('cancelListingService — scrap status restoration', () => {
  it('restores AVAILABLE status after cancelling the only listing', async () => {
    const partiallyListedScrap = {
      id: SCRAP_ID,
      ownerId: 'org-industry-1',
      listedQuantityKg: '100',
      availableQuantityKg: '0',
      status: 'FULLY_LISTED'
    };

    prisma.listing.findUnique.mockResolvedValue({
      id: LISTING_ID,
      status: 'DRAFT',
      quantityKg: '100',
      scrapRecordId: SCRAP_ID,
      scrapRecord: partiallyListedScrap
    });
    prisma.listing.update.mockResolvedValue({ id: LISTING_ID, status: 'CANCELLED' });
    prisma.scrapRecord.findUnique.mockResolvedValue(partiallyListedScrap);
    prisma.scrapRecord.update.mockResolvedValue({});

    const res = await request(app)
      .delete(`/api/marketplace/listings/${LISTING_ID}`)
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(200);
    expect(prisma.scrapRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'AVAILABLE', availableQuantityKg: 100 })
      })
    );
  });
});

// ── Integration: full ownership transfer via payment endpoint ─────────────────

describe('Integration: payment verification triggers ownership transfer', () => {
  const processingPayment = {
    id: PAYMENT_ID,
    saleId: SALE_ID,
    status: 'PROCESSING',
    amount: 10000
  };

  const saleWithProcessing = {
    ...completedSale,
    status: 'PAYMENT_PROCESSING',
    payment: processingPayment
  };

  it('POST /payments/verify — creates dealer inventory with DEALER_OWNED status', async () => {
    prisma.sale.findUnique.mockResolvedValue(saleWithProcessing);
    prisma.payment.update.mockResolvedValue({ ...processingPayment, status: 'SUCCESS' });
    prisma.sale.update.mockResolvedValue({});
    prisma.listing.update.mockResolvedValue({});
    // No existing buyer inventory
    prisma.scrapRecord.findUnique
      .mockResolvedValueOnce(null)   // sourceSaleId → not found
      .mockResolvedValueOnce({       // seller scrap re-fetch
        id: SCRAP_ID,
        listedQuantityKg: '100',
        soldQuantityKg: '0',
        availableQuantityKg: '0',
        status: 'FULLY_LISTED'
      });
    prisma.scrapRecord.create.mockResolvedValue({ id: 'new-dealer-inv' });
    prisma.scrapRecord.update.mockResolvedValue({});

    const res = await request(app)
      .post('/api/marketplace/payments/verify')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ saleId: SALE_ID, paymentId: PAYMENT_ID });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/ownership transferred/i);

    // Dealer inventory must be created with DEALER_OWNED
    expect(prisma.scrapRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ownerId: 'org-dealer-1',
          ownershipStatus: 'DEALER_OWNED',
          sourceSaleId: SALE_ID
        })
      })
    );

    // Seller scrap must be marked SOLD_OUT (avail=0, listed=0 after decrement)
    expect(prisma.scrapRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SOLD_OUT' })
      })
    );
  });
});
