import express from 'express';
import * as tenderController from './tender.controller.js';
import requireAuth from '../../../core/middlewares/auth.middleware.js';
import { allowRoles } from '../../../core/middlewares/role.middleware.js';
import { uploadTenderDoc, uploadSubmissionDoc } from '../../../core/middleware/upload.middleware.js';

const router = express.Router();

router.use(requireAuth);

// ── Industry manages their own tenders ───────────────────────────────────────

// POST /marketplace/tenders — create draft tender
router.post('/', allowRoles('INDUSTRY'), tenderController.createTender);

// GET /marketplace/tenders — list (INDUSTRY: own; DEALER/BUYER: open)
router.get('/', tenderController.getTenders);

// GET /marketplace/tenders/my-awards — must be before /:id to avoid wildcard match
router.get('/my-awards', allowRoles('DEALER'), tenderController.getMyAwards);

// GET /marketplace/tenders/:id — detail with confidentiality
router.get('/:id', tenderController.getTenderById);

// PATCH /marketplace/tenders/:id — update draft
router.patch('/:id', allowRoles('INDUSTRY'), tenderController.updateTender);

// POST /marketplace/tenders/:id/publish — DRAFT → OPEN or SCHEDULED
router.post('/:id/publish', allowRoles('INDUSTRY'), tenderController.publishTender);

// POST /marketplace/tenders/:id/start-evaluation — OPEN/CLOSED → UNDER_EVALUATION
router.post('/:id/start-evaluation', allowRoles('INDUSTRY'), tenderController.startEvaluation);

// PATCH /marketplace/tenders/:id/submissions/:submissionId — update submission status
router.patch('/:id/submissions/:submissionId', allowRoles('INDUSTRY'), tenderController.updateSubmissionStatus);

// POST /marketplace/tenders/:id/award — select winning submission
router.post('/:id/award', allowRoles('INDUSTRY'), tenderController.awardTender);

// PATCH /marketplace/tenders/:id/award/dispatch — Industry records scrap dispatch (PENDING → DISPATCHED)
router.patch('/:id/award/dispatch', allowRoles('INDUSTRY'), tenderController.dispatchTenderAward);

// PATCH /marketplace/tenders/:id/cancel — cancel tender
router.patch('/:id/cancel', allowRoles('INDUSTRY'), tenderController.cancelTender);

// GET /marketplace/tenders/:id/submissions — all submissions (Industry: after eval; Dealer: own only)
router.get('/:id/submissions', tenderController.getTenderSubmissions);

// GET /marketplace/tenders/:id/my-submission — dealer's own submission
router.get('/:id/my-submission', allowRoles('DEALER'), tenderController.getMySubmission);

// POST /marketplace/tenders/:id/submit-offer — submit sealed offer (DEALER only; tenders are Industry→Dealer channel)
router.post('/:id/submit-offer', allowRoles('DEALER'), tenderController.submitOffer);

// ── Award Workflow (DEALER only) ──────────────────────────────────────────────

// GET  /marketplace/tenders/:id/award — award detail for a specific tender
router.get('/:id/award', allowRoles('DEALER'), tenderController.getAwardByTender);

// POST /marketplace/tenders/:id/award/pay — initiate payment
router.post('/:id/award/pay', allowRoles('DEALER'), tenderController.initiateAwardPayment);

// POST /marketplace/tenders/:id/award/pay/verify — verify / confirm payment
router.post('/:id/award/pay/verify', allowRoles('DEALER'), tenderController.verifyAwardPayment);

// POST /marketplace/tenders/:id/award/transfer — confirm physical transfer
router.post('/:id/award/transfer', allowRoles('DEALER'), tenderController.confirmTransfer);

// POST /marketplace/tenders/:id/award/import — import scrap into dealer inventory
router.post('/:id/award/import', allowRoles('DEALER'), tenderController.importAwardToInventory);

// ── Document routes ───────────────────────────────────────────────────────────

// POST   /marketplace/tenders/:id/documents        — upload document (INDUSTRY only)
router.post(
  '/:id/documents',
  allowRoles('INDUSTRY'),
  (req, res, next) => {
    uploadTenderDoc(req, res, (err) => {
      if (err) return res.status(err.statusCode || 400).json({ success: false, message: err.message });
      next();
    });
  },
  tenderController.uploadDocument
);

// GET    /marketplace/tenders/:id/documents        — list documents
router.get('/:id/documents', tenderController.listDocuments);

// GET    /marketplace/tenders/:id/documents/:docId/download — download document
router.get('/:id/documents/:docId/download', tenderController.downloadDocument);

// DELETE /marketplace/tenders/:id/documents/:docId — delete document (INDUSTRY only)
router.delete('/:id/documents/:docId', allowRoles('INDUSTRY'), tenderController.deleteDocument);

// ── Submission document routes ────────────────────────────────────────────────

// POST   /marketplace/tenders/:id/submissions/:submissionId/documents — upload bid doc (DEALER own submission, OPEN tender)
router.post(
  '/:id/submissions/:submissionId/documents',
  allowRoles('DEALER'),
  (req, res, next) => {
    uploadSubmissionDoc(req, res, (err) => {
      if (err) return res.status(err.statusCode || 400).json({ success: false, message: err.message });
      next();
    });
  },
  tenderController.uploadSubmissionDocument
);

// GET    /marketplace/tenders/:id/submissions/:submissionId/documents — list
router.get('/:id/submissions/:submissionId/documents', tenderController.listSubmissionDocuments);

// GET    /marketplace/tenders/:id/submissions/:submissionId/documents/:docId/download — download
router.get('/:id/submissions/:submissionId/documents/:docId/download', tenderController.downloadSubmissionDocument);

export default router;
