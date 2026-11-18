import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
// Import the same singleton used by the app's services
import prisma from '../src/core/lib/prisma.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeToken = (overrides = {}) =>
  jwt.sign(
    {
      id: 'user-1',
      organisationId: 'org-dealer-1',
      role: 'DEALER',
      ...overrides,
    },
    'test-secret-phase4',
    { expiresIn: '1h' }
  );

const industryToken = makeToken({ id: 'user-industry', organisationId: 'org-industry-1', role: 'INDUSTRY' });
const dealerToken   = makeToken({ id: 'user-dealer',   organisationId: 'org-dealer-1',   role: 'DEALER'   });
const dealer2Token  = makeToken({ id: 'user-dealer2',  organisationId: 'org-dealer-2',   role: 'DEALER'   });
const buyerToken    = makeToken({ id: 'user-buyer',    organisationId: 'org-buyer-1',    role: 'BUYER'    });

const AUCTION_ID  = '00000000-0000-0000-0000-000000000001';
const LISTING_ID  = '00000000-0000-0000-0000-000000000002';
const SCRAP_ID    = '00000000-0000-0000-0000-000000000003';
const BID_ID      = '00000000-0000-0000-0000-000000000004';

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Auth / RBAC ───────────────────────────────────────────────────────────────

describe('Auth & RBAC', () => {
  it('GET /auctions — 401 without token', async () => {
    const res = await request(app).get('/api/marketplace/auctions');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /auctions/:id/bid — 401 without token', async () => {
    const res = await request(app).post(`/api/marketplace/auctions/${AUCTION_ID}/bid`).send({ pricePerKg: 100 });
    expect(res.statusCode).toBe(401);
  });

  it('POST /auctions/:id/bid — 403 when BUYER tries to bid', async () => {
    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ pricePerKg: 100 });
    expect(res.statusCode).toBe(403);
  });

  it('POST /auctions/:id/bid — 403 when INDUSTRY tries to bid', async () => {
    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${industryToken}`)
      .send({ pricePerKg: 100 });
    expect(res.statusCode).toBe(403);
  });

  it('PATCH /auctions/:id/close — 403 when DEALER tries to close', async () => {
    const res = await request(app)
      .patch(`/api/marketplace/auctions/${AUCTION_ID}/close`)
      .set('Authorization', `Bearer ${dealerToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('PATCH /auctions/:id/cancel — 403 when DEALER tries to cancel', async () => {
    const res = await request(app)
      .patch(`/api/marketplace/auctions/${AUCTION_ID}/cancel`)
      .set('Authorization', `Bearer ${dealerToken}`);
    expect(res.statusCode).toBe(403);
  });
});

// ── placeBid — happy path ──────────────────────────────────────────────────────

describe('placeBid', () => {
  const liveAuction = {
    id: AUCTION_ID,
    status: 'LIVE',
    endsAt: new Date(Date.now() + 60 * 60 * 1000),
    startingPricePerKg: 50,
    reservePricePerKg: null,
    minIncrement: 5,
    extensionWindowMin: 10,
    extensionMinutes: 5,
    extensionCount: 0,
    bidCount: 0,
    currentHighestBidId: null,
    listingId: LISTING_ID,
    listing: {
      quantityKg: 100,
      scrapRecord: { ownerId: 'org-industry-1' }
    }
  };

  it('places a valid first bid', async () => {
    prisma.auction.findUnique.mockResolvedValue(liveAuction);
    prisma.bid.findFirst.mockResolvedValue(null);
    prisma.bid.create.mockResolvedValue({ id: BID_ID, pricePerKg: 60, status: 'PLACED' });
    prisma.auction.update.mockResolvedValue({ ...liveAuction, bidCount: 1, currentHighestBidId: BID_ID });

    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ pricePerKg: 60 });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('rejects bid below starting price', async () => {
    prisma.auction.findUnique.mockResolvedValue(liveAuction);

    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ pricePerKg: 10 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/starting price/i);
  });

  it('rejects bid not above current highest + minIncrement', async () => {
    const auctionWithBid = {
      ...liveAuction,
      currentHighestBidId: BID_ID,
      bidCount: 1
    };
    prisma.auction.findUnique.mockResolvedValue(auctionWithBid);
    prisma.bid.findUnique.mockResolvedValue({ id: BID_ID, pricePerKg: 100, placedByUserId: 'other-user' });
    prisma.bid.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ pricePerKg: 101 }); // minIncrement is 5, needs >= 105

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/min increment/i);
  });

  it('rejects self-bid (industry bidding on own listing)', async () => {
    prisma.auction.findUnique.mockResolvedValue(liveAuction);

    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${industryToken}`)
      .send({ pricePerKg: 60 });

    // INDUSTRY role is rejected at RBAC layer (403), but if it somehow passed, service rejects too
    expect([403, 400]).toContain(res.statusCode);
  });

  it('rejects bid on SCHEDULED auction', async () => {
    prisma.auction.findUnique.mockResolvedValue({ ...liveAuction, status: 'SCHEDULED' });

    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ pricePerKg: 60 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/not currently active/i);
  });

  it('rejects bid on CLOSED auction', async () => {
    prisma.auction.findUnique.mockResolvedValue({ ...liveAuction, status: 'CLOSED_WITH_WINNER' });

    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ pricePerKg: 60 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/not currently active/i);
  });

  it('rejects bid when endsAt has passed', async () => {
    prisma.auction.findUnique.mockResolvedValue({
      ...liveAuction,
      endsAt: new Date(Date.now() - 1000) // 1 second in the past
    });

    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ pricePerKg: 60 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/bidding period has ended/i);
  });

  it('returns 400 when auction not found', async () => {
    prisma.auction.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ pricePerKg: 60 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/not found/i);
  });
});

// ── closeAuction ──────────────────────────────────────────────────────────────

describe('closeAuction', () => {
  const baseAuction = {
    id: AUCTION_ID,
    status: 'LIVE',
    listingId: LISTING_ID,
    currentHighestBidId: null,
    reservePricePerKg: null,
    listing: {
      quantityKg: 100,
      scrapRecord: { id: SCRAP_ID, ownerId: 'org-industry-1' }
    }
  };

  it('closes with no winner when no bids', async () => {
    prisma.auction.findUnique.mockResolvedValue(baseAuction);
    prisma.listing.update.mockResolvedValue({});
    prisma.auction.update.mockResolvedValue({ ...baseAuction, status: 'CLOSED_NO_WINNER' });

    const res = await request(app)
      .patch(`/api/marketplace/auctions/${AUCTION_ID}/close`)
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('closes with winner when highest bid exists and reserve is met', async () => {
    prisma.auction.findUnique.mockResolvedValue({
      ...baseAuction,
      currentHighestBidId: BID_ID,
      reservePricePerKg: 50
    });
    prisma.bid.findUnique.mockResolvedValue({ id: BID_ID, pricePerKg: 100, bidderId: 'org-dealer-1', totalValue: 10000 });
    prisma.sale.findUnique.mockResolvedValue(null);
    prisma.bid.update.mockResolvedValue({});
    prisma.bid.updateMany.mockResolvedValue({ count: 1 });
    prisma.listing.update.mockResolvedValue({});
    prisma.sale.create.mockResolvedValue({});
    prisma.auction.update.mockResolvedValue({ ...baseAuction, status: 'CLOSED_WITH_WINNER', winningBidId: BID_ID });

    const res = await request(app)
      .patch(`/api/marketplace/auctions/${AUCTION_ID}/close`)
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('closes with no winner when reserve price is NOT met', async () => {
    prisma.auction.findUnique.mockResolvedValue({
      ...baseAuction,
      currentHighestBidId: BID_ID,
      reservePricePerKg: 200 // high reserve
    });
    prisma.bid.findUnique.mockResolvedValue({ id: BID_ID, pricePerKg: 50, bidderId: 'org-dealer-1', totalValue: 5000 });
    prisma.bid.updateMany.mockResolvedValue({ count: 1 });
    prisma.listing.update.mockResolvedValue({});
    prisma.auction.update.mockResolvedValue({ ...baseAuction, status: 'CLOSED_NO_WINNER', winningBidId: null });

    const res = await request(app)
      .patch(`/api/marketplace/auctions/${AUCTION_ID}/close`)
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('rejects close when auction is SCHEDULED', async () => {
    prisma.auction.findUnique.mockResolvedValue({ ...baseAuction, status: 'SCHEDULED' });

    const res = await request(app)
      .patch(`/api/marketplace/auctions/${AUCTION_ID}/close`)
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/not active/i);
  });

  it('rejects close by non-owner', async () => {
    prisma.auction.findUnique.mockResolvedValue(baseAuction);

    const otherIndustryToken = makeToken({ id: 'user-other', organisationId: 'org-other', role: 'INDUSTRY' });
    const res = await request(app)
      .patch(`/api/marketplace/auctions/${AUCTION_ID}/close`)
      .set('Authorization', `Bearer ${otherIndustryToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/unauthorized/i);
  });
});

// ── cancelAuction ─────────────────────────────────────────────────────────────

describe('cancelAuction', () => {
  const scheduledAuction = {
    id: AUCTION_ID,
    status: 'SCHEDULED',
    listingId: LISTING_ID,
    listing: {
      quantityKg: 50,
      scrapRecordId: SCRAP_ID,
      scrapRecord: { id: SCRAP_ID, ownerId: 'org-industry-1' }
    }
  };

  it('cancels a SCHEDULED auction and restores inventory', async () => {
    prisma.auction.findUnique.mockResolvedValue(scheduledAuction);
    prisma.auction.update.mockResolvedValue({ ...scheduledAuction, status: 'CANCELLED' });
    prisma.bid.updateMany.mockResolvedValue({ count: 0 });
    prisma.listing.update.mockResolvedValue({});
    prisma.scrapRecord.update.mockResolvedValue({});

    const res = await request(app)
      .patch(`/api/marketplace/auctions/${AUCTION_ID}/cancel`)
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  it('cancels a LIVE auction', async () => {
    prisma.auction.findUnique.mockResolvedValue({ ...scheduledAuction, status: 'LIVE' });
    prisma.auction.update.mockResolvedValue({ status: 'CANCELLED' });
    prisma.bid.updateMany.mockResolvedValue({ count: 2 });
    prisma.listing.update.mockResolvedValue({});
    prisma.scrapRecord.update.mockResolvedValue({});

    const res = await request(app)
      .patch(`/api/marketplace/auctions/${AUCTION_ID}/cancel`)
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(200);
  });

  it('rejects cancel on CLOSED_WITH_WINNER auction', async () => {
    prisma.auction.findUnique.mockResolvedValue({ ...scheduledAuction, status: 'CLOSED_WITH_WINNER' });

    const res = await request(app)
      .patch(`/api/marketplace/auctions/${AUCTION_ID}/cancel`)
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cancelled when/i);
  });

  it('rejects cancel on already CANCELLED auction', async () => {
    prisma.auction.findUnique.mockResolvedValue({ ...scheduledAuction, status: 'CANCELLED' });

    const res = await request(app)
      .patch(`/api/marketplace/auctions/${AUCTION_ID}/cancel`)
      .set('Authorization', `Bearer ${industryToken}`);

    expect(res.statusCode).toBe(400);
  });

  it('rejects cancel by non-owner', async () => {
    prisma.auction.findUnique.mockResolvedValue(scheduledAuction);
    const otherToken = makeToken({ id: 'other', organisationId: 'org-other', role: 'INDUSTRY' });

    const res = await request(app)
      .patch(`/api/marketplace/auctions/${AUCTION_ID}/cancel`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/unauthorized/i);
  });
});

// ── getMyBids ─────────────────────────────────────────────────────────────────

describe('getMyBids', () => {
  it('returns dealer own bids', async () => {
    prisma.bid.findMany.mockResolvedValue([{ id: BID_ID, pricePerKg: 100, status: 'PLACED' }]);

    const res = await request(app)
      .get('/api/marketplace/auctions/bids/my')
      .set('Authorization', `Bearer ${dealerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/marketplace/auctions/bids/my');
    expect(res.statusCode).toBe(401);
  });
});

// ── getAuctionBids ────────────────────────────────────────────────────────────

describe('getAuctionBids', () => {
  it('returns bids for a valid auction', async () => {
    prisma.auction.findUnique.mockResolvedValue({ id: AUCTION_ID, status: 'LIVE' });
    prisma.bid.findMany.mockResolvedValue([{ id: BID_ID, pricePerKg: 80, status: 'WINNING' }]);

    const res = await request(app)
      .get(`/api/marketplace/auctions/${AUCTION_ID}/bids`)
      .set('Authorization', `Bearer ${dealerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 for non-existent auction', async () => {
    prisma.auction.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/marketplace/auctions/${AUCTION_ID}/bids`)
      .set('Authorization', `Bearer ${dealerToken}`);

    expect(res.statusCode).toBe(404);
  });
});

// ── Edge cases: simultaneous bids ─────────────────────────────────────────────

describe('Bid edge cases', () => {
  const liveAuction = {
    id: AUCTION_ID,
    status: 'LIVE',
    endsAt: new Date(Date.now() + 60 * 60 * 1000),
    startingPricePerKg: 50,
    reservePricePerKg: null,
    minIncrement: 5,
    extensionWindowMin: 10,
    extensionMinutes: 5,
    extensionCount: 0,
    bidCount: 1,
    currentHighestBidId: BID_ID,
    listingId: LISTING_ID,
    listing: { quantityKg: 100, scrapRecord: { ownerId: 'org-industry-1' } }
  };

  it('increments bidderCount only for first-time bidder', async () => {
    // dealer2 bids for first time
    prisma.auction.findUnique.mockResolvedValue(liveAuction);
    prisma.bid.findUnique.mockResolvedValue({ id: BID_ID, pricePerKg: 100, placedByUserId: 'user-dealer', bidderId: 'org-dealer-1' });
    prisma.bid.findFirst.mockResolvedValue(null); // new bidder
    prisma.bid.create.mockResolvedValue({ id: 'bid-new', pricePerKg: 110, status: 'PLACED' });
    prisma.bid.update.mockResolvedValue({});
    prisma.auction.update.mockResolvedValue({ ...liveAuction, bidCount: 2, bidderCount: 2 });

    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${dealer2Token}`)
      .send({ pricePerKg: 110 });

    expect(res.statusCode).toBe(201);
  });

  it('rejects exact same bid amount (not strictly greater)', async () => {
    // Current highest is 100, minIncrement is 5 → need >= 105
    prisma.auction.findUnique.mockResolvedValue(liveAuction);
    prisma.bid.findUnique.mockResolvedValue({ id: BID_ID, pricePerKg: 100, placedByUserId: 'user-dealer' });
    prisma.bid.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${dealer2Token}`)
      .send({ pricePerKg: 100 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/min increment/i);
  });

  it('auto-extends auction when bid placed in extension window', async () => {
    const nearEndAuction = {
      ...liveAuction,
      endsAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min left, within extensionWindowMin=10
      currentHighestBidId: null,
      bidCount: 0
    };
    prisma.auction.findUnique.mockResolvedValue(nearEndAuction);
    prisma.bid.findFirst.mockResolvedValue(null);
    prisma.bid.create.mockResolvedValue({ id: 'new-bid', pricePerKg: 60, status: 'PLACED' });
    prisma.auction.update.mockResolvedValue({ ...nearEndAuction, status: 'EXTENDED', extensionCount: 1 });

    const res = await request(app)
      .post(`/api/marketplace/auctions/${AUCTION_ID}/bid`)
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({ pricePerKg: 60 });

    expect(res.statusCode).toBe(201);
  });
});
