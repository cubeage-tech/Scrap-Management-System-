import { jest } from '@jest/globals';

export const Prisma = {};

const mockModel = (extra = {}) => ({
  findMany: jest.fn().mockResolvedValue([]),
  findUnique: jest.fn().mockResolvedValue(null),
  findFirst: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  updateMany: jest.fn().mockResolvedValue({ count: 0 }),
  delete: jest.fn().mockResolvedValue({}),
  count: jest.fn().mockResolvedValue(0),
  ...extra,
});

export class PrismaClient {
  $connect() { return Promise.resolve(); }
  $disconnect() { return Promise.resolve(); }
  $transaction(cb) {
    if (typeof cb === 'function') return cb(this);
    return Promise.all(cb);
  }

  user = mockModel();
  organisation = mockModel();
  scrapRecord = mockModel();
  scrapImage = mockModel();
  category = mockModel();
  listing = mockModel();
  auction = mockModel();
  bid = mockModel();
  quotation = mockModel();
  sale = mockModel();
  payment = mockModel();
  notification = mockModel();
  procurement = mockModel();
}

export default { PrismaClient };
