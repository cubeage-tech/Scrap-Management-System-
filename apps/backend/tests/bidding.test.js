import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
// Import the same singleton used by the app's services
import prisma from '../src/core/lib/prisma.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeToken = (overrides = {}) =>
  jwt.sign(
    { id: 'user-1', organisationId: 'org-industry-1', role: 'INDUSTRY', ...overrides },
    'test-secret-phase4',
    { expiresIn: '1h' }
  );

const industryToken = makeToken();
const dealerToken   = makeToken({ id: 'user-dealer', organisationId: 'org-dealer-1', role: 'DEALER' });

const LISTING_ID   = '00000000-0000-0000-0000-000000000010';
const SCRAP_ID     = '00000000-0000-0000-0000-000000000011';
const QUOTATION_ID = '00000000-0000-0000-0000-000000000012';

beforeEach(() => { jest.clearAllMocks(); });

// ── RBAC: create quotation ────────────────────────────────────────────────────

describe('Quotation RBAC', () => {
  it('POST /quotations — 403 for INDUSTRY (BUG-007 fixed)', async () => {
    const res = await request(app)
      .post('/api/marketplace/quotations')
      .set('Authorization', `Bearer ${industryToken}`)
      .send({ listingId: LISTING_ID, pricePerKg: 100 });
    expect(res.statusCode).toBe(403);
  });

  it('POST /quotations — 401 without token', async () => {
    const res = await request(app)
      .post('/api/marketplace/quotations')
      .send({ listingId: LISTING_ID, pricePerKg: 100 });
    expect(res.statusCode).toBe(401);
  });
});

