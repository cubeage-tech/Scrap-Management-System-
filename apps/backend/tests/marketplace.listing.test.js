/**
 * Marketplace Listing Filter Tests
 *
 * Verifies:
 *   - Unauthenticated requests → 401
 *   - ownerBusinessType=INDUSTRY excludes dealer-owned listings
 *   - ownerBusinessType=DEALER includes only dealer-owned listings (Buyer Marketplace)
 *   - Invalid ownerBusinessType values are sanitized and not passed to Prisma
 *   - Service builds correct Prisma WHERE clause for each business type
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import prisma from '../src/core/lib/prisma.js';
import { getListingsService } from '../src/modules/marketplace/listings/listing.service.js';

const makeToken = (overrides = {}) =>
  jwt.sign(
    { id: 'user-1', organisationId: 'org-industry-1', role: 'INDUSTRY', ...overrides },
    'test-secret-phase4',
    { expiresIn: '1h' }
  );

const industryToken = makeToken();
const dealerToken   = makeToken({ id: 'user-dealer', organisationId: 'org-dealer-1', role: 'DEALER' });
const buyerToken    = makeToken({ id: 'user-buyer',  organisationId: 'org-buyer-1',  role: 'BUYER'  });

const DEALER_LISTING = {
  id: 'listing-dealer-1',
  status: 'PUBLISHED',
  sellingMode: 'QUOTATION',
  quantityKg: '500',
  expectedPricePerKg: '45',
  createdAt: new Date().toISOString(),
  scrapRecord: {
    description: 'Copper wire scrap',
    condition: 'USED',
    locationLabel: 'Mumbai',
    category: { name: 'Non-Ferrous' },
    images: [],
    owner: { id: 'org-dealer-1', companyName: 'Dealer Co Ltd', businessType: 'DEALER' },
  },
};

const INDUSTRY_LISTING = {
  id: 'listing-industry-1',
  status: 'PUBLISHED',
  sellingMode: 'QUOTATION',
  quantityKg: '1000',
  expectedPricePerKg: '30',
  createdAt: new Date().toISOString(),
  scrapRecord: {
    description: 'Steel HMS offcuts',
    condition: 'USED',
    locationLabel: 'Pune',
    category: { name: 'Ferrous' },
    images: [],
    owner: { id: 'org-industry-1', companyName: 'Industry Corp', businessType: 'INDUSTRY' },
  },
};

beforeEach(() => { jest.resetAllMocks(); });

// ── Access Control ─────────────────────────────────────────────────────────────

describe('GET /api/marketplace/listings — access control', () => {
  it('returns 401 for unauthenticated requests', async () => {
    const res = await request(app).get('/api/marketplace/listings');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 for malformed Bearer token', async () => {
    const res = await request(app)
      .get('/api/marketplace/listings')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 for authenticated Industry user', async () => {
    prisma.listing.findMany.mockResolvedValue([]);
    prisma.listing.count.mockResolvedValue(0);
    const res = await request(app)
      .get('/api/marketplace/listings')
      .set('Authorization', `Bearer ${industryToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ── Service: WHERE clause construction ────────────────────────────────────────

describe('getListingsService — Prisma WHERE clause for ownerBusinessType', () => {
  beforeEach(() => {
    prisma.listing.findMany.mockResolvedValue([]);
    prisma.listing.count.mockResolvedValue(0);
  });

  it('adds owner.businessType=INDUSTRY filter when ownerBusinessType=INDUSTRY', async () => {
    await getListingsService({ ownerBusinessType: 'INDUSTRY' });
    const whereArg = prisma.listing.findMany.mock.calls[0][0].where;
    expect(whereArg.scrapRecord).toEqual(
      expect.objectContaining({ owner: { businessType: 'INDUSTRY' } })
    );
  });

  it('adds owner.businessType=DEALER filter when ownerBusinessType=DEALER', async () => {
    await getListingsService({ ownerBusinessType: 'DEALER' });
    const whereArg = prisma.listing.findMany.mock.calls[0][0].where;
    expect(whereArg.scrapRecord).toEqual(
      expect.objectContaining({ owner: { businessType: 'DEALER' } })
    );
  });

  it('does not add scrapRecord filter when ownerBusinessType is undefined', async () => {
    await getListingsService({});
    const whereArg = prisma.listing.findMany.mock.calls[0][0].where;
    expect(whereArg.scrapRecord).toBeUndefined();
  });
});

// ── Industry Marketplace: dealer listings excluded ─────────────────────────────

describe('Industry Marketplace — dealer resale listings excluded', () => {
  it('dealer listing is absent from response when ownerBusinessType=INDUSTRY', async () => {
    // DB is queried with businessType=INDUSTRY so Prisma returns only industry scrap.
    // Simulate: no matching industry listings (dealer listing is not returned).
    prisma.listing.findMany.mockResolvedValue([]);
    prisma.listing.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/marketplace/listings?status=PUBLISHED&ownerBusinessType=INDUSTRY')
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(0);

    // Confirm Prisma received the INDUSTRY business type filter
    const whereArg = prisma.listing.findMany.mock.calls[0][0].where;
    expect(whereArg.scrapRecord?.owner?.businessType).toBe('INDUSTRY');
  });

  it('industry listing is included when ownerBusinessType=INDUSTRY', async () => {
    prisma.listing.findMany.mockResolvedValue([INDUSTRY_LISTING]);
    prisma.listing.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/marketplace/listings?status=PUBLISHED&ownerBusinessType=INDUSTRY')
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe('listing-industry-1');
  });
});

// ── Buyer Marketplace: dealer listings included ───────────────────────────────

describe('Buyer Marketplace — dealer resale listings visible', () => {
  it('dealer listing is present when ownerBusinessType=DEALER', async () => {
    prisma.listing.findMany.mockResolvedValue([DEALER_LISTING]);
    prisma.listing.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/marketplace/listings?status=PUBLISHED&ownerBusinessType=DEALER')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe('listing-dealer-1');

    const whereArg = prisma.listing.findMany.mock.calls[0][0].where;
    expect(whereArg.scrapRecord?.owner?.businessType).toBe('DEALER');
  });

  it('industry listing is absent from Buyer Marketplace (DEALER filter excludes it)', async () => {
    // With DEALER filter, Prisma returns only dealer-owned scrap.
    // Industry listing would not come through.
    prisma.listing.findMany.mockResolvedValue([]);
    prisma.listing.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/marketplace/listings?status=PUBLISHED&ownerBusinessType=DEALER')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

// ── Input sanitization ────────────────────────────────────────────────────────

describe('ownerBusinessType input sanitization', () => {
  beforeEach(() => {
    prisma.listing.findMany.mockResolvedValue([]);
    prisma.listing.count.mockResolvedValue(0);
  });

  it('sanitizes invalid ownerBusinessType — no scrapRecord filter passed to Prisma', async () => {
    const res = await request(app)
      .get('/api/marketplace/listings?ownerBusinessType=HACKER')
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(200);
    const whereArg = prisma.listing.findMany.mock.calls[0][0].where;
    // Invalid value must be discarded — no owner filter in the query
    expect(whereArg.scrapRecord).toBeUndefined();
  });

  it('sanitizes empty ownerBusinessType — no scrapRecord filter', async () => {
    const res = await request(app)
      .get('/api/marketplace/listings?ownerBusinessType=')
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(200);
    const whereArg = prisma.listing.findMany.mock.calls[0][0].where;
    expect(whereArg.scrapRecord).toBeUndefined();
  });
});

// ── Buyer quotation endpoint still protected ──────────────────────────────────

describe('Buyer quotation flow — authentication preserved', () => {
  it('POST /api/marketplace/quotations still requires authentication', async () => {
    const res = await request(app)
      .post('/api/marketplace/quotations')
      .send({ listingId: DEALER_LISTING.id, pricePerKg: 45, quantityKg: 100 });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
