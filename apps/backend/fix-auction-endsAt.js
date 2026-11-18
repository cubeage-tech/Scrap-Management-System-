// One-time dev script: set ALL non-closed auctions to LIVE with a fresh 24h window
import prisma from './src/core/lib/prisma.js';

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

const result = await prisma.auction.updateMany({
  where: {
    status: { in: ['SCHEDULED', 'LIVE', 'EXTENDED'] }
  },
  data: {
    status: 'LIVE',
    endsAt: tomorrow
  }
});

console.log(`Fixed ${result.count} auction(s) — set to LIVE, endsAt = ${tomorrow.toISOString()}`);
await prisma.$disconnect();
