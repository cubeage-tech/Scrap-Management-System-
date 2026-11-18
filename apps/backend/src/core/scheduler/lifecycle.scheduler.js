import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { createNotification } from '../../modules/notification/notification.service.js';

const PREFIX = '[LifecycleScheduler]';

// ── Notification helper — fire-and-forget per org ────────────────────────────

const notifyOrg = async (organisationId, payload) => {
  try {
    const user = await prisma.user.findFirst({
      where: { organisationId, isActive: true },
    });
    if (user) {
      createNotification({ userId: user.id, ...payload }).catch(() => {});
    }
  } catch (_) { /* non-fatal */ }
};

// ── Tender transitions ────────────────────────────────────────────────────────

const tickTenders = async () => {
  const now = new Date();

  // 1. SCHEDULED → OPEN: opening time has arrived
  const opened = await prisma.tender.updateMany({
    where: { status: 'SCHEDULED', opensAt: { lte: now } },
    data:  { status: 'OPEN' },
  });
  if (opened.count > 0) {
    console.log(`${PREFIX} ${opened.count} tender(s) SCHEDULED → OPEN`);
  }

  // 2. OPEN → UNDER_EVALUATION: submission deadline has passed
  // Fetch first so we can send targeted notifications to submitting dealers.
  const expiredTenders = await prisma.tender.findMany({
    where:  { status: 'OPEN', closesAt: { lte: now } },
    select: {
      id:    true,
      title: true,
      submissions: { select: { dealerId: true } },
    },
  });

  if (expiredTenders.length > 0) {
    await prisma.tender.updateMany({
      where: { status: 'OPEN', closesAt: { lte: now } },
      data:  { status: 'UNDER_EVALUATION', closedAt: now, evaluationStartedAt: now },
    });
    console.log(`${PREFIX} ${expiredTenders.length} tender(s) OPEN → UNDER_EVALUATION`);

    for (const tender of expiredTenders) {
      const dealerIds = [...new Set(tender.submissions.map((s) => s.dealerId))];
      for (const orgId of dealerIds) {
        await notifyOrg(orgId, {
          type:       'TENDER_EVALUATION_STARTED',
          title:      'Tender Evaluation Started',
          message:    `Submissions for tender "${tender.title}" are now under evaluation. Results will be announced soon.`,
          entityType: 'TENDER',
          entityId:   tender.id,
        });
      }
    }
  }
};

// ── Auction transitions ───────────────────────────────────────────────────────

const tickAuctions = async () => {
  const now = new Date();

  // 1. SCHEDULED → LIVE: start time has arrived
  const goingLive = await prisma.auction.findMany({
    where:   { status: 'SCHEDULED', startsAt: { lte: now } },
    include: {
      listing: {
        include: {
          scrapRecord: {
            select: { ownerId: true, description: true, category: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (goingLive.length > 0) {
    await prisma.auction.updateMany({
      where: { status: 'SCHEDULED', startsAt: { lte: now } },
      data:  { status: 'LIVE' },
    });
    console.log(`${PREFIX} ${goingLive.length} auction(s) SCHEDULED → LIVE`);

    for (const auction of goingLive) {
      const scrap = auction.listing?.scrapRecord;
      if (!scrap?.ownerId) continue;
      const materialName = scrap.description || scrap.category?.name || 'Scrap Material';
      await notifyOrg(scrap.ownerId, {
        type:       'AUCTION_STARTING',
        title:      'Your Auction is Now Live',
        message:    `The auction for "${materialName}" has started and is now accepting bids.`,
        entityType: 'AUCTION',
        entityId:   auction.id,
      });
    }
  }

  // 2. LIVE → CLOSED_NO_WINNER: end time passed and no winning bid
  const closingNoWinner = await prisma.auction.findMany({
    where: {
      status:      'LIVE',
      endsAt:      { lte: now },
      winningBidId: null,
    },
    include: {
      bids: { select: { bidderId: true } },
      listing: {
        include: {
          scrapRecord: { select: { ownerId: true, description: true, category: { select: { name: true } } } },
        },
      },
    },
  });

  if (closingNoWinner.length > 0) {
    await prisma.auction.updateMany({
      where: { status: 'LIVE', endsAt: { lte: now }, winningBidId: null },
      data:  { status: 'CLOSED_NO_WINNER', closedAt: now },
    });
    console.log(`${PREFIX} ${closingNoWinner.length} auction(s) LIVE → CLOSED_NO_WINNER`);

    for (const auction of closingNoWinner) {
      const scrap = auction.listing?.scrapRecord;
      const materialName = scrap?.description || scrap?.category?.name || 'Scrap Material';

      // Notify the seller
      if (scrap?.ownerId) {
        await notifyOrg(scrap.ownerId, {
          type:       'AUCTION_NO_WINNER',
          title:      'Auction Closed — No Winner',
          message:    `Your auction for "${materialName}" closed without a winning bid. Consider relisting.`,
          entityType: 'AUCTION',
          entityId:   auction.id,
        });
      }

      // Notify all bidders who participated
      const bidderIds = [...new Set(auction.bids.map((b) => b.bidderId))];
      for (const orgId of bidderIds) {
        await notifyOrg(orgId, {
          type:       'AUCTION_NO_WINNER',
          title:      'Auction Closed — No Winner',
          message:    `The auction for "${materialName}" you participated in closed without a winner.`,
          entityType: 'AUCTION',
          entityId:   auction.id,
        });
      }
    }
  }
};

// ── Combined tick ─────────────────────────────────────────────────────────────

const tick = async () => {
  await tickTenders().catch((err) =>
    console.error(`${PREFIX} tender tick error (non-fatal):`, err.message)
  );
  await tickAuctions().catch((err) =>
    console.error(`${PREFIX} auction tick error (non-fatal):`, err.message)
  );
};

// ── Start ─────────────────────────────────────────────────────────────────────

export const startLifecycleScheduler = () => {
  console.log(`${PREFIX} started — cron */5 * * * *`);

  // Run immediately on startup to catch any missed transitions
  tick();

  // Schedule every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    tick();
  });
};
