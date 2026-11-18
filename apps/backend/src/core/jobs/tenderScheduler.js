import prisma from '../lib/prisma.js';

const POLL_MS = 60_000; // every 60 seconds

const tick = async () => {
  const now = new Date();
  try {
    // 1. SCHEDULED → OPEN: opening time has arrived
    const opened = await prisma.tender.updateMany({
      where: { status: 'SCHEDULED', opensAt: { lte: now } },
      data:  { status: 'OPEN' },
    });
    if (opened.count > 0) {
      console.log(`[TenderScheduler] ${opened.count} tender(s) SCHEDULED → OPEN`);
    }

    // 2. OPEN → CLOSED: submission deadline has passed
    const closed = await prisma.tender.updateMany({
      where: { status: 'OPEN', closesAt: { lte: now } },
      data:  { status: 'CLOSED', closedAt: now },
    });
    if (closed.count > 0) {
      console.log(`[TenderScheduler] ${closed.count} tender(s) OPEN → CLOSED`);
    }
  } catch (err) {
    console.error('[TenderScheduler] tick error (non-fatal):', err.message);
  }
};

export const startTenderScheduler = () => {
  console.log('[TenderScheduler] started — polling every 60 s');
  tick(); // run immediately on startup to catch any missed transitions
  const timer = setInterval(tick, POLL_MS);
  // .unref() lets the process exit cleanly when the HTTP server shuts down
  // without this timer being the sole thing keeping Node alive
  if (timer.unref) timer.unref();
  return timer;
};
