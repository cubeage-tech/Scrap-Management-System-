import { randomUUID } from 'crypto';
import prisma from '../../../core/lib/prisma.js';
import { Prisma } from '@prisma/client';
import { createNotification } from '../../notification/notification.service.js';

// ── Error helpers ─────────────────────────────────────────────────────────────

const notFoundError  = (msg = 'Tender not found') => Object.assign(new Error(msg), { statusCode: 404 });
const forbiddenError = (msg = 'Forbidden')         => Object.assign(new Error(msg), { statusCode: 403 });
const badRequestError = (msg)                      => Object.assign(new Error(msg), { statusCode: 400 });

// ── Ref generator ─────────────────────────────────────────────────────────────

const generateRef = () => {
  const id = randomUUID();
  return `TND-${id.slice(0, 8).toUpperCase()}`;
};

// ── Common includes ───────────────────────────────────────────────────────────

const TENDER_SCRAP_INCLUDE = {
  category: { select: { id: true, name: true } },
  owner:    { select: { id: true, companyName: true, businessType: true } },
  images:   { take: 3, orderBy: { sortOrder: 'asc' } },
};

// ── Create Tender (DRAFT) ─────────────────────────────────────────────────────

export const createTender = async (data, ownerId, userId) => {
  const scrap = await prisma.scrapRecord.findUnique({
    where: { id: data.scrapRecordId },
    include: { category: { select: { id: true, name: true } } },
  });

  if (!scrap) throw notFoundError('Scrap record not found');
  if (scrap.ownerId !== ownerId) throw forbiddenError('Cannot create a tender for scrap you do not own');
  if (scrap.status === 'SOLD_OUT') throw badRequestError('Cannot create a tender for sold-out inventory');
  if (scrap.ownershipStatus === 'TRANSFER_PENDING') throw badRequestError('Cannot create a tender while ownership transfer is pending');

  const qty = Number(data.quantityKg);
  if (qty <= 0) throw badRequestError('Quantity must be greater than 0');
  if (qty > Number(scrap.availableQuantityKg)) {
    throw badRequestError(`Quantity exceeds available inventory (${scrap.availableQuantityKg} kg)`);
  }

  if (!data.closesAt) throw badRequestError('Submission deadline (closesAt) is required');
  const closesAt = new Date(data.closesAt);
  const opensAt  = data.opensAt ? new Date(data.opensAt) : new Date();
  if (opensAt >= closesAt) throw badRequestError('Submission deadline must be after the opening date');

  const id  = randomUUID();
  const ref = generateRef();

  return await prisma.$transaction(async (tx) => {
    const tender = await tx.tender.create({
      data: {
        id,
        ref,
        ownerId,
        scrapRecordId: data.scrapRecordId,
        title:           data.title || scrap.description || scrap.category?.name || 'Untitled Tender',
        description:     data.description  ?? null,
        terms:           data.terms        ?? null,
        quantityKg:      qty,
        reservePricePerKg: data.reservePricePerKg ?? null,
        locationLabel:   data.locationLabel ?? scrap.locationLabel ?? null,
        opensAt,
        closesAt,
        status:          'DRAFT',
        createdByUserId: userId ?? null,
      },
      include: { scrapRecord: { include: TENDER_SCRAP_INCLUDE } },
    });

    const newAvail  = Number(scrap.availableQuantityKg) - qty;
    const newListed = Number(scrap.listedQuantityKg) + qty;
    await tx.scrapRecord.update({
      where: { id: data.scrapRecordId },
      data: {
        listedQuantityKg:    newListed,
        availableQuantityKg: newAvail,
        status:              newAvail <= 0 ? 'FULLY_LISTED' : 'PARTIALLY_LISTED',
      },
    });

    return tender;
  });
};

// ── Publish Tender (DRAFT → OPEN or SCHEDULED) ────────────────────────────────

export const publishTender = async (tenderId, ownerId) => {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });

  if (!tender) throw notFoundError();
  if (tender.ownerId !== ownerId) throw forbiddenError();
  if (tender.status !== 'DRAFT') throw badRequestError('Only draft tenders can be published');

  const now    = new Date();
  const status = tender.opensAt && tender.opensAt > now ? 'SCHEDULED' : 'OPEN';

  return await prisma.tender.update({
    where: { id: tenderId },
    data:  { status, publishedAt: now },
    include: { scrapRecord: { include: TENDER_SCRAP_INCLUDE } },
  });
};

// ── List Tenders ──────────────────────────────────────────────────────────────

export const getTenders = async (filters = {}, orgId, role) => {
  const where = {};

  if (role === 'INDUSTRY') {
    where.ownerId = orgId;
    if (filters.status) where.status = filters.status;
  } else {
    // Dealers / Buyers see published tenders (SCHEDULED = upcoming, cannot bid yet; OPEN = bidding live)
    where.status = { in: ['SCHEDULED', 'OPEN', 'CLOSED', 'UNDER_EVALUATION', 'AWARDED'] };
  }

  if (filters.categoryId) {
    where.scrapRecord = { categoryId: filters.categoryId };
  }

  const tenders = await prisma.tender.findMany({
    where,
    include: {
      scrapRecord: { include: TENDER_SCRAP_INCLUDE },
      submissions: {
        select: { id: true, dealerId: true, status: true, pricePerKg: true, totalValue: true, createdAt: true },
      },
      award: { select: { id: true, dealerId: true, finalPricePerKg: true, finalTotalValue: true, awardedAt: true, dealer: { select: { companyName: true, city: true, state: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return tenders.map((t) => {
    const mySubmission = role !== 'INDUSTRY'
      ? t.submissions.find((s) => s.dealerId === orgId)
      : null;

    return {
      id:               t.id,
      ref:              t.ref,
      title:            t.title,
      status:           t.status,
      quantityKg:       Number(t.quantityKg),
      reservePricePerKg: t.reservePricePerKg ? Number(t.reservePricePerKg) : null,
      locationLabel:    t.locationLabel,
      opensAt:          t.opensAt,
      closesAt:         t.closesAt,
      publishedAt:      t.publishedAt,
      createdAt:        t.createdAt,
      scrapRecord:      t.scrapRecord,
      submissionCount:  t.submissions.length,
      uniqueDealerCount: new Set(t.submissions.map((s) => s.dealerId)).size,
      mySubmissionStatus:     mySubmission?.status                                ?? null,
      mySubmissionId:         mySubmission?.id                                    ?? null,
      mySubmissionPricePerKg: mySubmission?.pricePerKg ? Number(mySubmission.pricePerKg) : null,
      mySubmissionTotalValue: mySubmission?.totalValue ? Number(mySubmission.totalValue) : null,
      mySubmissionDate:       mySubmission?.createdAt                             ?? null,
      isAwarded:              t.award != null,
      award:                  t.award ? {
        id:              t.award.id,
        dealerId:        t.award.dealerId,
        finalPricePerKg: Number(t.award.finalPricePerKg),
        finalTotalValue: Number(t.award.finalTotalValue),
        awardedAt:       t.award.awardedAt,
        dealer:          t.award.dealer,
      } : null,
    };
  });
};

// ── Get Tender By ID (with confidentiality) ───────────────────────────────────

export const getTenderById = async (tenderId, requestingOrgId, role) => {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: {
      scrapRecord:  { include: TENDER_SCRAP_INCLUDE },
      submissions: {
        include: {
          dealer: { select: { id: true, companyName: true, businessType: true, city: true } },
        },
        orderBy: { pricePerKg: 'desc' },
      },
      award: {
        include: {
          dealer: { select: { id: true, companyName: true } },
          submission: { select: { id: true, pricePerKg: true, totalValue: true, paymentTerms: true } },
        },
      },
    },
  });

  if (!tender) throw notFoundError();

  const isOwner = tender.ownerId === requestingOrgId;

  // Non-owners cannot see DRAFT tenders
  if (!isOwner && tender.status === 'DRAFT') throw forbiddenError();

  const isEvaluating = ['UNDER_EVALUATION', 'AWARDED', 'UNSUCCESSFUL'].includes(tender.status);

  const safeSubmissions = tender.submissions.map((s) => {
    if (role !== 'INDUSTRY') {
      // Dealers see only their own submission; price visible after evaluation starts
      if (s.dealerId !== requestingOrgId) return null;
      return {
        id:          s.id,
        status:      s.status,
        pricePerKg:  Number(s.pricePerKg),
        totalValue:  Number(s.totalValue),
        paymentTerms: s.paymentTerms,
        note:        s.note,
        submittedAt: s.createdAt,
      };
    }

    // Industry: prices hidden until evaluation phase
    const priceVisible = isEvaluating;
    return {
      id:           s.id,
      dealerId:     s.dealerId,
      dealer:       s.dealer,
      status:       s.status,
      pricePerKg:   priceVisible ? Number(s.pricePerKg)  : null,
      totalValue:   priceVisible ? Number(s.totalValue)  : null,
      paymentTerms: s.paymentTerms,
      note:         s.note,
      evaluationNote:         s.evaluationNote,
      disqualificationReason: s.disqualificationReason,
      submittedAt:  s.createdAt,
    };
  }).filter(Boolean);

  // Don't expose reservePricePerKg to non-owners
  const reserveVisible = isOwner;

  return {
    id:               tender.id,
    ref:              tender.ref,
    title:            tender.title,
    description:      tender.description,
    terms:            tender.terms,
    status:           tender.status,
    quantityKg:       Number(tender.quantityKg),
    reservePricePerKg: reserveVisible && tender.reservePricePerKg ? Number(tender.reservePricePerKg) : null,
    locationLabel:    tender.locationLabel,
    opensAt:          tender.opensAt,
    closesAt:         tender.closesAt,
    publishedAt:      tender.publishedAt,
    closedAt:         tender.closedAt,
    evaluationStartedAt: tender.evaluationStartedAt,
    cancelledAt:      tender.cancelledAt,
    createdAt:        tender.createdAt,
    scrapRecord:      tender.scrapRecord,
    isOwner,
    isEvaluating,
    submissions:      safeSubmissions,
    submissionCount:  tender.submissions.length,
    uniqueDealerCount: new Set(tender.submissions.map((s) => s.dealerId)).size,
    award:            tender.award,
  };
};

// ── Submit Offer (Dealer) ─────────────────────────────────────────────────────

export const submitOffer = async (tenderId, offerData, dealerId, userId) => {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: { scrapRecord: { select: { ownerId: true, description: true } } },
  });

  if (!tender) throw notFoundError();
  if (tender.status !== 'OPEN') throw badRequestError('This tender is not open for submissions');
  if (tender.ownerId === dealerId) throw forbiddenError('Cannot submit an offer on your own tender');

  if (new Date() > new Date(tender.closesAt)) {
    throw badRequestError('Submission deadline has passed');
  }

  const existing = await prisma.tenderSubmission.findUnique({
    where: { tenderId_dealerId: { tenderId, dealerId } },
  });
  if (existing) throw badRequestError('You have already submitted an offer for this tender');

  const pricePerKg = Number(offerData.pricePerKg);
  if (pricePerKg <= 0) throw badRequestError('Offer price must be greater than 0');

  const totalValue = new Prisma.Decimal(pricePerKg).mul(new Prisma.Decimal(Number(tender.quantityKg)));

  const submission = await prisma.tenderSubmission.create({
    data: {
      tenderId,
      dealerId,
      pricePerKg:       offerData.pricePerKg,
      totalValue,
      paymentTerms:     offerData.paymentTerms ?? null,
      note:             offerData.note         ?? null,
      status:           'SUBMITTED',
      submittedByUserId: userId ?? null,
    },
    include: {
      dealer: { select: { companyName: true } },
    },
  });

  // Notify seller (non-blocking)
  try {
    const sellerUser = await prisma.user.findFirst({
      where: { organisationId: tender.ownerId, isActive: true },
    });
    if (sellerUser) {
      await createNotification({
        userId:     sellerUser.id,
        type:       'TENDER_SUBMISSION_RECEIVED',
        title:      'New Tender Submission',
        message:    `A sealed offer was submitted for your tender "${tender.title}".`,
        entityType: 'TENDER',
        entityId:   tenderId,
      });
    }
  } catch (e) {
    console.error('Tender submission notification error (non-fatal):', e.message);
  }

  return { ...submission, message: 'Offer submitted. It will remain sealed until you start evaluation.' };
};

// ── Start Evaluation (OPEN/CLOSED → UNDER_EVALUATION) ────────────────────────

export const startEvaluation = async (tenderId, ownerId) => {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: {
      submissions: { where: { status: 'SUBMITTED' }, select: { id: true, dealerId: true } },
    },
  });

  if (!tender) throw notFoundError();
  if (tender.ownerId !== ownerId) throw forbiddenError();
  if (!['OPEN', 'CLOSED'].includes(tender.status)) {
    throw badRequestError('Only OPEN or CLOSED tenders can move to evaluation');
  }

  if (tender.submissions.length === 0) {
    // No submissions — mark UNSUCCESSFUL immediately
    return await prisma.tender.update({
      where: { id: tenderId },
      data: {
        status:             'UNSUCCESSFUL',
        closedAt:           new Date(),
        evaluationStartedAt: new Date(),
        cancelledAt:        null,
      },
    });
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    // Transition all SUBMITTED submissions to UNDER_REVIEW
    await tx.tenderSubmission.updateMany({
      where: { tenderId, status: 'SUBMITTED' },
      data:  { status: 'UNDER_REVIEW' },
    });

    return await tx.tender.update({
      where: { id: tenderId },
      data: {
        status:             'UNDER_EVALUATION',
        closedAt:           now,
        evaluationStartedAt: now,
      },
      include: {
        scrapRecord:  { include: TENDER_SCRAP_INCLUDE },
        submissions: {
          include: { dealer: { select: { id: true, companyName: true } } },
          orderBy: { pricePerKg: 'desc' },
        },
      },
    });
  });

  // Notify all participating dealers (evaluation started = offers now visible)
  try {
    const uniqueDealerIds = [...new Set(tender.submissions.map((s) => s.dealerId))];
    for (const dId of uniqueDealerIds) {
      const user = await prisma.user.findFirst({ where: { organisationId: dId, isActive: true } });
      if (user) {
        await createNotification({
          userId:     user.id,
          type:       'TENDER_EVALUATION_STARTED',
          title:      'Tender Evaluation Started',
          message:    `The industry has started evaluating submissions for tender "${tender.title}".`,
          entityType: 'TENDER',
          entityId:   tenderId,
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.error('Tender evaluation notification error (non-fatal):', e.message);
  }

  return result;
};

// ── Update Submission Status / Evaluation Note (ELIGIBLE / DISQUALIFIED / note) ──

export const updateSubmissionStatus = async (tenderId, submissionId, statusData, ownerId) => {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw notFoundError();
  if (tender.ownerId !== ownerId) throw forbiddenError();
  if (tender.status !== 'UNDER_EVALUATION') {
    throw badRequestError('Can only update submission status during evaluation phase');
  }

  const submission = await prisma.tenderSubmission.findUnique({ where: { id: submissionId } });
  if (!submission) throw notFoundError('Submission not found');
  if (submission.tenderId !== tenderId) throw badRequestError('Submission does not belong to this tender');

  const updateData = {};

  if (statusData.status !== undefined) {
    const allowed = ['ELIGIBLE', 'DISQUALIFIED', 'UNDER_REVIEW'];
    if (!allowed.includes(statusData.status)) {
      throw badRequestError('Status must be ELIGIBLE, DISQUALIFIED, or UNDER_REVIEW');
    }
    updateData.status = statusData.status;
  }

  if (statusData.evaluationNote !== undefined) {
    updateData.evaluationNote = statusData.evaluationNote;
  }

  if (statusData.disqualificationReason !== undefined) {
    updateData.disqualificationReason = statusData.disqualificationReason;
  }

  if (Object.keys(updateData).length === 0) {
    throw badRequestError('Nothing to update');
  }

  const updated = await prisma.tenderSubmission.update({
    where: { id: submissionId },
    data:  updateData,
  });

  // Notify dealer if disqualified (fire-and-forget)
  if (updateData.status === 'DISQUALIFIED') {
    try {
      const user = await prisma.user.findFirst({ where: { organisationId: submission.dealerId, isActive: true } });
      if (user) {
        await createNotification({
          userId:     user.id,
          type:       'TENDER_NOT_AWARDED',
          title:      'Submission Disqualified',
          message:    `Your submission for tender "${tender.title}" has been disqualified.${updateData.disqualificationReason ? ` Reason: ${updateData.disqualificationReason}` : ''}`,
          entityType: 'TENDER',
          entityId:   tenderId,
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Disqualification notification error (non-fatal):', e.message);
    }
  }

  return updated;
};

// ── Award Tender (UNDER_EVALUATION → AWARDED) ─────────────────────────────────

export const awardTender = async (tenderId, submissionId, ownerId, userId) => {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: { scrapRecord: { select: { ownerId: true, description: true } } },
  });

  if (!tender) throw notFoundError();
  if (tender.ownerId !== ownerId) throw forbiddenError();
  if (tender.status !== 'UNDER_EVALUATION') {
    throw badRequestError('Tender must be in UNDER_EVALUATION status to award');
  }

  // Explicit duplicate-award guard — prevents cryptic DB unique constraint errors
  const existingAward = await prisma.tenderAward.findUnique({ where: { tenderId } });
  if (existingAward) throw badRequestError('This tender has already been awarded');

  const submission = await prisma.tenderSubmission.findUnique({
    where: { id: submissionId },
    include: { dealer: { select: { id: true, companyName: true } } },
  });

  if (!submission) throw notFoundError('Submission not found');
  if (submission.tenderId !== tenderId) throw badRequestError('Submission does not belong to this tender');
  if (submission.status === 'DISQUALIFIED') {
    throw badRequestError('Cannot award a disqualified submission');
  }

  // Reserve price enforcement
  if (tender.reservePricePerKg && Number(submission.pricePerKg) < Number(tender.reservePricePerKg)) {
    throw badRequestError(
      `Selected offer (₹${Number(submission.pricePerKg)}/kg) is below the reserve price (₹${Number(tender.reservePricePerKg)}/kg)`
    );
  }

  const award = await prisma.$transaction(async (tx) => {
    // Atomic concurrency guard: transition tender status inside the transaction.
    // If two simultaneous requests race here, only one will get count=1; the
    // other gets count=0 and receives a clean 400 instead of a P2002 constraint error.
    const guard = await tx.tender.updateMany({
      where: { id: tenderId, status: 'UNDER_EVALUATION' },
      data:  { status: 'AWARDED' },
    });
    if (guard.count === 0) {
      throw badRequestError('Tender status changed concurrently — please refresh and retry');
    }

    // Mark winning submission as SELECTED
    await tx.tenderSubmission.update({
      where: { id: submissionId },
      data:  { status: 'SELECTED' },
    });

    // Mark all other non-disqualified submissions as NOT_SELECTED
    await tx.tenderSubmission.updateMany({
      where: { tenderId, id: { not: submissionId }, status: { not: 'DISQUALIFIED' } },
      data:  { status: 'NOT_SELECTED' },
    });

    // Create TenderAward record
    return await tx.tenderAward.create({
      data: {
        tenderId,
        submissionId,
        dealerId:        submission.dealerId,
        finalPricePerKg: submission.pricePerKg,
        finalTotalValue: submission.totalValue,
        quantityKg:      tender.quantityKg,
        selectionReason: null,
        awardedByUserId: userId ?? null,
        paymentTerms:    submission.paymentTerms ?? null,
        paymentDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paymentStatus:   'PENDING',
      },
    });
  });

  // Notifications (non-blocking)
  try {
    const materialName = tender.title;

    const winnerUser = await prisma.user.findFirst({
      where: { organisationId: submission.dealerId, isActive: true },
    });
    if (winnerUser) {
      await createNotification({
        userId:     winnerUser.id,
        type:       'TENDER_AWARDED',
        title:      'Tender Awarded to You!',
        message:    `Congratulations! Your offer of ₹${Number(submission.pricePerKg).toLocaleString('en-IN')}/kg for "${materialName}" was selected. Please proceed with payment.`,
        entityType: 'TENDER',
        entityId:   tenderId,
      }).catch(() => {});
    }

    const notSelected = await prisma.tenderSubmission.findMany({
      where:  { tenderId, id: { not: submissionId }, status: { in: ['NOT_SELECTED', 'DISQUALIFIED'] } },
      select: { dealerId: true },
    });
    for (const { dealerId } of notSelected) {
      const user = await prisma.user.findFirst({ where: { organisationId: dealerId, isActive: true } });
      if (user) {
        await createNotification({
          userId:     user.id,
          type:       'TENDER_NOT_AWARDED',
          title:      'Tender Result',
          message:    `The tender for "${materialName}" has been awarded to another dealer. Thank you for participating.`,
          entityType: 'TENDER',
          entityId:   tenderId,
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.error('Tender award notification error (non-fatal):', e.message);
  }

  return award;
};

// ── Get Tender Submissions ────────────────────────────────────────────────────

export const getTenderSubmissions = async (tenderId, requestingOrgId, role) => {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw notFoundError();

  const isOwner = tender.ownerId === requestingOrgId;

  if (role === 'INDUSTRY') {
    if (!isOwner) throw forbiddenError();
    // Prices only visible once evaluation starts
    const priceVisible = ['UNDER_EVALUATION', 'AWARDED', 'UNSUCCESSFUL', 'CANCELLED'].includes(tender.status);

    const submissions = await prisma.tenderSubmission.findMany({
      where:   { tenderId },
      include: { dealer: { select: { id: true, companyName: true, businessType: true, city: true } } },
      orderBy: { pricePerKg: 'desc' },
    });

    return submissions.map((s) => ({
      id:           s.id,
      dealerId:     s.dealerId,
      dealer:       s.dealer,
      status:       s.status,
      pricePerKg:   priceVisible ? Number(s.pricePerKg) : null,
      totalValue:   priceVisible ? Number(s.totalValue) : null,
      paymentTerms: s.paymentTerms,
      note:         s.note,
      evaluationNote:         s.evaluationNote,
      disqualificationReason: s.disqualificationReason,
      submittedAt:  s.createdAt,
    }));
  }

  // Dealer/Buyer: only their own submission
  const mine = await prisma.tenderSubmission.findUnique({
    where: { tenderId_dealerId: { tenderId, dealerId: requestingOrgId } },
  });
  if (!mine) return [];

  return [{
    id:          mine.id,
    status:      mine.status,
    pricePerKg:  Number(mine.pricePerKg),
    totalValue:  Number(mine.totalValue),
    paymentTerms: mine.paymentTerms,
    note:        mine.note,
    submittedAt: mine.createdAt,
  }];
};

// ── Get My Submission (Dealer) ────────────────────────────────────────────────

export const getMySubmission = async (tenderId, dealerId) => {
  const submission = await prisma.tenderSubmission.findUnique({
    where:   { tenderId_dealerId: { tenderId, dealerId } },
    include: {
      tender: {
        include: { scrapRecord: { include: { category: true } } },
      },
    },
  });

  if (!submission) return null;

  return {
    id:          submission.id,
    status:      submission.status,
    pricePerKg:  Number(submission.pricePerKg),
    totalValue:  Number(submission.totalValue),
    paymentTerms: submission.paymentTerms,
    note:        submission.note,
    submittedAt: submission.createdAt,
    tender:      submission.tender,
  };
};

// ── Cancel Tender ─────────────────────────────────────────────────────────────

export const cancelTender = async (tenderId, ownerId) => {
  const tender = await prisma.tender.findUnique({
    where:   { id: tenderId },
    include: { submissions: { where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'ELIGIBLE'] } } } },
  });

  if (!tender) throw notFoundError();
  if (tender.ownerId !== ownerId) throw forbiddenError();
  if (['AWARDED', 'CANCELLED'].includes(tender.status)) {
    throw badRequestError('Cannot cancel an awarded or already cancelled tender');
  }

  return await prisma.$transaction(async (tx) => {
    // Withdraw all active submissions
    if (tender.submissions.length > 0) {
      await tx.tenderSubmission.updateMany({
        where: { tenderId, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'ELIGIBLE'] } },
        data:  { status: 'NOT_SELECTED' },
      });
    }

    // Restore scrap inventory
    const scrap = await tx.scrapRecord.findUnique({ where: { id: tender.scrapRecordId } });
    const cancelQty = Number(tender.quantityKg);
    const newListed = Math.max(0, Number(scrap.listedQuantityKg) - cancelQty);
    const newAvail  = Number(scrap.availableQuantityKg) + cancelQty;

    const scrapStatus = newListed <= 0 ? 'AVAILABLE' : newAvail <= 0 ? 'FULLY_LISTED' : 'PARTIALLY_LISTED';

    await tx.scrapRecord.update({
      where: { id: tender.scrapRecordId },
      data:  { listedQuantityKg: newListed, availableQuantityKg: newAvail, status: scrapStatus },
    });

    const cancelled = await tx.tender.update({
      where: { id: tenderId },
      data:  { status: 'CANCELLED', cancelledAt: new Date(), closedAt: new Date() },
    });
    return cancelled;
  }).then(async (cancelled) => {
    // Notify all dealers who submitted (fire-and-forget)
    try {
      const uniqueDealerIds = [...new Set(tender.submissions.map((s) => s.dealerId))];
      for (const dId of uniqueDealerIds) {
        const user = await prisma.user.findFirst({ where: { organisationId: dId, isActive: true } });
        if (user) {
          await createNotification({
            userId:     user.id,
            type:       'TENDER_CANCELLED',
            title:      'Tender Cancelled',
            message:    `The tender "${tender.title}" has been cancelled by the industry. Your submission has been withdrawn.`,
            entityType: 'TENDER',
            entityId:   tenderId,
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Tender cancellation notification error (non-fatal):', e.message);
    }
    return cancelled;
  });
};

// ── Update Draft Tender ───────────────────────────────────────────────────────

export const updateTender = async (tenderId, data, ownerId) => {
  const tender = await prisma.tender.findUnique({
    where:   { id: tenderId },
    include: { scrapRecord: { select: { availableQuantityKg: true, listedQuantityKg: true } } },
  });

  if (!tender) throw notFoundError();
  if (tender.ownerId !== ownerId) throw forbiddenError();
  if (tender.status !== 'DRAFT') throw badRequestError('Only draft tenders can be edited');

  const update = {};
  if (data.title       !== undefined) update.title       = data.title;
  if (data.description !== undefined) update.description = data.description;
  if (data.terms       !== undefined) update.terms       = data.terms;
  if (data.locationLabel !== undefined) update.locationLabel = data.locationLabel;
  if (data.reservePricePerKg !== undefined) update.reservePricePerKg = data.reservePricePerKg;
  if (data.closesAt    !== undefined) update.closesAt    = data.closesAt ? new Date(data.closesAt) : null;
  if (data.opensAt     !== undefined) update.opensAt     = data.opensAt  ? new Date(data.opensAt)  : null;

  if (data.quantityKg !== undefined) {
    const newQty = Number(data.quantityKg);
    const oldQty = Number(tender.quantityKg);
    const diff   = newQty - oldQty;

    if (diff > 0 && diff > Number(tender.scrapRecord.availableQuantityKg)) {
      throw badRequestError('Insufficient available inventory for the requested quantity increase');
    }

    update.quantityKg = newQty;

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.tender.update({
        where: { id: tenderId },
        data:  update,
        include: { scrapRecord: { include: TENDER_SCRAP_INCLUDE } },
      });
      await tx.scrapRecord.update({
        where: { id: tender.scrapRecordId },
        data: {
          listedQuantityKg:    diff > 0 ? { increment: diff }        : { decrement: Math.abs(diff) },
          availableQuantityKg: diff > 0 ? { decrement: diff }        : { increment: Math.abs(diff) },
        },
      });
      return updated;
    });
  }

  return await prisma.tender.update({
    where: { id: tenderId },
    data:  update,
    include: { scrapRecord: { include: TENDER_SCRAP_INCLUDE } },
  });
};

// ── Tender Documents ──────────────────────────────────────────────────────────

export const uploadTenderDocument = async (tenderId, file, userId, ownerId) => {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw notFoundError();
  if (tender.ownerId !== ownerId) throw forbiddenError('Cannot upload documents for a tender you do not own');

  const existing = await prisma.tenderDocument.count({ where: { tenderId } });
  if (existing >= 10) throw badRequestError('Maximum 10 documents per tender');

  return await prisma.tenderDocument.create({
    data: {
      tenderId,
      originalName:     file.originalname,
      storedName:       file.filename,
      mimeType:         file.mimetype,
      fileSizeBytes:    file.size,
      uploadedByUserId: userId ?? null,
    },
    select: { id: true, originalName: true, mimeType: true, fileSizeBytes: true, createdAt: true },
  });
};

export const listTenderDocuments = async (tenderId, requestingOrgId, role) => {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw notFoundError();

  const isOwner = tender.ownerId === requestingOrgId;

  if (role === 'INDUSTRY' && !isOwner) throw forbiddenError();

  if (role === 'DEALER') {
    const visibleStatuses = ['SCHEDULED', 'OPEN', 'CLOSED', 'UNDER_EVALUATION', 'AWARDED', 'UNSUCCESSFUL'];
    if (!visibleStatuses.includes(tender.status)) throw forbiddenError('Tender documents not available');
  }

  return await prisma.tenderDocument.findMany({
    where:   { tenderId },
    select:  { id: true, originalName: true, mimeType: true, fileSizeBytes: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
};

export const getTenderDocumentForDownload = async (tenderId, docId, requestingOrgId, role) => {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw notFoundError();

  const isOwner = tender.ownerId === requestingOrgId;

  if (role === 'INDUSTRY' && !isOwner) throw forbiddenError();

  if (role === 'DEALER') {
    const visibleStatuses = ['SCHEDULED', 'OPEN', 'CLOSED', 'UNDER_EVALUATION', 'AWARDED', 'UNSUCCESSFUL'];
    if (!visibleStatuses.includes(tender.status)) throw forbiddenError('Tender documents not accessible');
  }

  const doc = await prisma.tenderDocument.findFirst({
    where: { id: docId, tenderId },
  });
  if (!doc) throw notFoundError('Document not found');

  return doc;
};

export const uploadSubmissionDocument = async (tenderId, submissionId, file, userId, dealerOrgId) => {
  const submission = await prisma.tenderSubmission.findUnique({
    where: { id: submissionId },
    include: { tender: { select: { id: true, status: true, ownerId: true, closesAt: true } } },
  });

  if (!submission) throw notFoundError('Submission not found');
  if (submission.tenderId !== tenderId) throw badRequestError('Submission does not belong to this tender');
  if (submission.dealerId !== dealerOrgId) throw forbiddenError('Cannot upload documents for another dealer\'s submission');
  if (submission.tender.status !== 'OPEN') throw badRequestError('Tender is no longer accepting submissions');
  if (new Date() > new Date(submission.tender.closesAt)) throw badRequestError('Submission deadline has passed');

  const existing = await prisma.tenderSubmissionDocument.count({ where: { submissionId } });
  if (existing >= 5) throw badRequestError('Maximum 5 documents per submission');

  return await prisma.tenderSubmissionDocument.create({
    data: {
      submissionId,
      originalName:     file.originalname,
      storedName:       file.filename,
      mimeType:         file.mimetype,
      fileSizeBytes:    file.size,
      uploadedByUserId: userId ?? null,
    },
    select: { id: true, originalName: true, mimeType: true, fileSizeBytes: true, createdAt: true },
  });
};

export const listSubmissionDocuments = async (tenderId, submissionId, requestingOrgId, role) => {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw notFoundError();

  const submission = await prisma.tenderSubmission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.tenderId !== tenderId) throw notFoundError('Submission not found');

  if (role === 'INDUSTRY') {
    if (tender.ownerId !== requestingOrgId) throw forbiddenError();
    const canSee = ['UNDER_EVALUATION', 'AWARDED', 'UNSUCCESSFUL', 'CANCELLED'].includes(tender.status);
    if (!canSee) throw forbiddenError('Documents only visible during evaluation');
  } else {
    if (submission.dealerId !== requestingOrgId) throw forbiddenError();
  }

  return await prisma.tenderSubmissionDocument.findMany({
    where:   { submissionId },
    select:  { id: true, originalName: true, mimeType: true, fileSizeBytes: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
};

export const getSubmissionDocumentForDownload = async (tenderId, submissionId, docId, requestingOrgId, role) => {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw notFoundError();

  const submission = await prisma.tenderSubmission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.tenderId !== tenderId) throw notFoundError('Submission not found');

  if (role === 'INDUSTRY') {
    if (tender.ownerId !== requestingOrgId) throw forbiddenError();
    const canSee = ['UNDER_EVALUATION', 'AWARDED', 'UNSUCCESSFUL', 'CANCELLED'].includes(tender.status);
    if (!canSee) throw forbiddenError('Documents only visible during evaluation');
  } else {
    if (submission.dealerId !== requestingOrgId) throw forbiddenError();
  }

  const doc = await prisma.tenderSubmissionDocument.findFirst({ where: { id: docId, submissionId } });
  if (!doc) throw notFoundError('Document not found');
  return doc;
};

export const deleteTenderDocument = async (tenderId, docId, ownerId) => {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw notFoundError();
  if (tender.ownerId !== ownerId) throw forbiddenError();
  if (!['DRAFT', 'SCHEDULED'].includes(tender.status)) {
    throw badRequestError('Documents can only be removed from draft or scheduled tenders');
  }

  const doc = await prisma.tenderDocument.findFirst({ where: { id: docId, tenderId } });
  if (!doc) throw notFoundError('Document not found');

  await prisma.tenderDocument.delete({ where: { id: docId } });

  return doc;
};

// ── Award Workflow ────────────────────────────────────────────────────────────

const AWARD_INCLUDE = {
  tender: {
    select: {
      id: true, ref: true, title: true, quantityKg: true,
      scrapRecord: { select: { description: true, condition: true, category: { select: { id: true, name: true } } } },
      owner: { select: { companyName: true } },
    },
  },
  dealer:  { select: { id: true, companyName: true } },
  inventoryRecord: { select: { id: true, availableQuantityKg: true, status: true } },
};

// GET /marketplace/tenders/my-awards — dealer's own awards
export const getMyAwards = async (dealerId) => {
  return await prisma.tenderAward.findMany({
    where:   { dealerId },
    include: AWARD_INCLUDE,
    orderBy: { awardedAt: 'desc' },
  });
};

// GET /marketplace/tenders/:id/award — single award for the winning dealer
export const getAwardByTender = async (tenderId, dealerId) => {
  const award = await prisma.tenderAward.findUnique({
    where:   { tenderId },
    include: AWARD_INCLUDE,
  });
  if (!award) throw notFoundError('Award not found');
  if (award.dealerId !== dealerId) throw forbiddenError();
  return award;
};

// POST /marketplace/tenders/:id/award/pay — initiate payment (manual/dev flow)
export const initiateAwardPayment = async (tenderId, dealerId) => {
  const award = await prisma.tenderAward.findUnique({ where: { tenderId } });
  if (!award)                              throw notFoundError('Award not found');
  if (award.dealerId !== dealerId)          throw forbiddenError();
  if (award.paymentStatus === 'SUCCESS')    throw badRequestError('Award has already been paid');
  if (award.paymentStatus === 'PROCESSING') throw badRequestError('Payment already in progress');

  return await prisma.tenderAward.update({
    where: { tenderId },
    data:  { paymentStatus: 'PROCESSING' },
    include: AWARD_INCLUDE,
  });
};

// POST /marketplace/tenders/:id/award/pay/verify — mark payment as verified/paid
export const verifyAwardPayment = async (tenderId, dealerId) => {
  const award = await prisma.tenderAward.findUnique({ where: { tenderId } });
  if (!award)                             throw notFoundError('Award not found');
  if (award.dealerId !== dealerId)         throw forbiddenError();
  if (award.paymentStatus === 'SUCCESS')   return award; // idempotent
  if (award.paymentStatus !== 'PROCESSING') throw badRequestError('Payment must be initiated before verifying');

  return await prisma.tenderAward.update({
    where: { tenderId },
    data:  { paymentStatus: 'SUCCESS', paidAt: new Date() },
    include: AWARD_INCLUDE,
  });
};

// POST /marketplace/tenders/:id/award/transfer — record physical scrap transfer
export const confirmTransfer = async (tenderId, dealerId, { transferQtyKg, transferNotes }, userId) => {
  const award = await prisma.tenderAward.findUnique({ where: { tenderId } });
  if (!award)                           throw notFoundError('Award not found');
  if (award.dealerId !== dealerId)       throw forbiddenError();
  if (award.paymentStatus !== 'SUCCESS') throw badRequestError('Payment must be verified before confirming transfer');
  if (award.transferStatus === 'COMPLETED') return award; // idempotent

  const qty = parseFloat(transferQtyKg);
  if (!qty || qty <= 0)                                        throw badRequestError('Transfer quantity must be positive');
  if (qty > parseFloat(award.quantityKg))                      throw badRequestError(`Transfer quantity cannot exceed awarded quantity of ${award.quantityKg} kg`);

  return await prisma.tenderAward.update({
    where: { tenderId },
    data: {
      transferStatus:      'COMPLETED',
      transferDate:        new Date(),
      transferQtyKg:       qty,
      transferNotes:       transferNotes ?? null,
      transferConfirmedBy: userId ?? null,
    },
    include: AWARD_INCLUDE,
  });
};

// PATCH /marketplace/tenders/:id/award/dispatch — Industry records that scrap has been dispatched
export const dispatchTenderAward = async (tenderId, organisationId) => {
  const award = await prisma.tenderAward.findUnique({
    where:   { tenderId },
    include: { tender: { select: { id: true, title: true, ownerId: true } } },
  });

  if (!award) throw notFoundError('Award not found');
  if (award.tender.ownerId !== organisationId) throw forbiddenError('Only the tender owner can dispatch this award');
  if (award.transferStatus === 'COMPLETED') throw badRequestError('Cannot update a completed transfer');

  // Idempotent: already dispatched — return the full award record
  if (award.transferStatus === 'DISPATCHED') {
    return await prisma.tenderAward.findUnique({ where: { tenderId }, include: AWARD_INCLUDE });
  }

  const updated = await prisma.tenderAward.update({
    where:   { tenderId },
    data:    { transferStatus: 'DISPATCHED' },
    include: AWARD_INCLUDE,
  });

  // Notify winning dealer (fire-and-forget)
  try {
    const dealerUser = await prisma.user.findFirst({
      where: { organisationId: award.dealerId, isActive: true },
    });
    if (dealerUser) {
      createNotification({
        userId:     dealerUser.id,
        type:       'OWNERSHIP_TRANSFERRED',
        title:      'Scrap Dispatched',
        message:    `Scrap for tender "${award.tender.title}" has been dispatched. Please confirm receipt when it arrives.`,
        entityType: 'TENDER',
        entityId:   tenderId,
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Dispatch notification error (non-fatal):', e.message);
  }

  return updated;
};

// POST /marketplace/tenders/:id/award/import — import transferred scrap into dealer inventory
export const importAwardToInventory = async (tenderId, dealerId, userId) => {
  const award = await prisma.tenderAward.findUnique({
    where:   { tenderId },
    include: {
      tender: { include: { scrapRecord: { include: { category: true } } } },
      inventoryRecord: true,
    },
  });
  if (!award)                                  throw notFoundError('Award not found');
  if (award.dealerId !== dealerId)              throw forbiddenError();
  if (award.paymentStatus !== 'SUCCESS')        throw badRequestError('Payment must be verified before importing inventory');
  if (award.transferStatus !== 'COMPLETED')     throw badRequestError('Physical transfer must be confirmed before importing inventory');
  if (award.inventoryRecord)                    return award.inventoryRecord; // idempotent

  const scrap = award.tender.scrapRecord;
  const qty   = parseFloat(award.transferQtyKg ?? award.quantityKg);

  return await prisma.$transaction(async (tx) => {
    return await tx.scrapRecord.create({
      data: {
        ownerId:              dealerId,
        categoryId:           scrap.categoryId,
        description:          `Tender Award #${award.tender.ref} — ${scrap.description || scrap.category.name}`,
        condition:            scrap.condition || 'USED',
        totalQuantityKg:      qty,
        availableQuantityKg:  qty,
        listedQuantityKg:     0,
        soldQuantityKg:       0,
        status:               'AVAILABLE',
        sourceTenderAwardId:  award.id,
        createdByUserId:      userId ?? null,
      },
      include: { category: true },
    });
  });
};
