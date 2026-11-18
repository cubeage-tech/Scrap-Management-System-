import path from 'path';
import * as tenderService from './tender.service.js';
import { UPLOAD_DIR, SUB_DOC_DIR } from '../../../core/middleware/upload.middleware.js';

export const createTender = async (req, res) => {
  try {
    const tender = await tenderService.createTender(req.body, req.user.organisationId, req.user.id);
    res.status(201).json({ success: true, data: tender });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const publishTender = async (req, res) => {
  try {
    const tender = await tenderService.publishTender(req.params.id, req.user.organisationId);
    res.status(200).json({ success: true, data: tender });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const getTenders = async (req, res) => {
  try {
    const tenders = await tenderService.getTenders(
      { status: req.query.status, categoryId: req.query.categoryId },
      req.user.organisationId,
      req.user.role
    );
    res.status(200).json({ success: true, data: tenders });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const getTenderById = async (req, res) => {
  try {
    const tender = await tenderService.getTenderById(
      req.params.id,
      req.user.organisationId,
      req.user.role
    );
    res.status(200).json({ success: true, data: tender });
  } catch (err) {
    res.status(err.statusCode || 404).json({ success: false, message: err.message });
  }
};

export const updateTender = async (req, res) => {
  try {
    const tender = await tenderService.updateTender(
      req.params.id,
      req.body,
      req.user.organisationId
    );
    res.status(200).json({ success: true, data: tender });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const submitOffer = async (req, res) => {
  try {
    const offer = await tenderService.submitOffer(
      req.params.id,
      req.body,
      req.user.organisationId,
      req.user.id
    );
    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const startEvaluation = async (req, res) => {
  try {
    const result = await tenderService.startEvaluation(req.params.id, req.user.organisationId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const updateSubmissionStatus = async (req, res) => {
  try {
    const result = await tenderService.updateSubmissionStatus(
      req.params.id,
      req.params.submissionId,
      req.body,
      req.user.organisationId
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const awardTender = async (req, res) => {
  try {
    const { submissionId } = req.body;
    if (!submissionId) {
      return res.status(400).json({ success: false, message: 'submissionId is required' });
    }
    const award = await tenderService.awardTender(
      req.params.id,
      submissionId,
      req.user.organisationId,
      req.user.id
    );
    res.status(200).json({ success: true, data: award });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const getTenderSubmissions = async (req, res) => {
  try {
    const submissions = await tenderService.getTenderSubmissions(
      req.params.id,
      req.user.organisationId,
      req.user.role
    );
    res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const getMySubmission = async (req, res) => {
  try {
    const submission = await tenderService.getMySubmission(
      req.params.id,
      req.user.organisationId
    );
    res.status(200).json({ success: true, data: submission });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const cancelTender = async (req, res) => {
  try {
    const result = await tenderService.cancelTender(req.params.id, req.user.organisationId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

// ── Document Handlers ─────────────────────────────────────────────────────────

export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  try {
    const doc = await tenderService.uploadTenderDocument(
      req.params.id,
      req.file,
      req.user.id,
      req.user.organisationId
    );
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const listDocuments = async (req, res) => {
  try {
    const docs = await tenderService.listTenderDocuments(
      req.params.id,
      req.user.organisationId,
      req.user.role
    );
    res.status(200).json({ success: true, data: docs });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const doc = await tenderService.getTenderDocumentForDownload(
      req.params.id,
      req.params.docId,
      req.user.organisationId,
      req.user.role
    );
    const filePath = path.join(UPLOAD_DIR, doc.storedName);
    res.download(filePath, doc.originalName, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ success: false, message: 'File download failed' });
      }
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await tenderService.deleteTenderDocument(
      req.params.id,
      req.params.docId,
      req.user.organisationId
    );
    // Attempt to remove physical file (non-fatal)
    try {
      const { unlink } = await import('fs/promises');
      await unlink(path.join(UPLOAD_DIR, doc.storedName));
    } catch (_e) { /* file may already be missing */ }
    res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

// ── Submission Document Handlers ──────────────────────────────────────────────

export const uploadSubmissionDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  try {
    const doc = await tenderService.uploadSubmissionDocument(
      req.params.id,
      req.params.submissionId,
      req.file,
      req.user.id,
      req.user.organisationId
    );
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const listSubmissionDocuments = async (req, res) => {
  try {
    const docs = await tenderService.listSubmissionDocuments(
      req.params.id,
      req.params.submissionId,
      req.user.organisationId,
      req.user.role
    );
    res.status(200).json({ success: true, data: docs });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const downloadSubmissionDocument = async (req, res) => {
  try {
    const doc = await tenderService.getSubmissionDocumentForDownload(
      req.params.id,
      req.params.submissionId,
      req.params.docId,
      req.user.organisationId,
      req.user.role
    );
    const filePath = path.join(SUB_DOC_DIR, doc.storedName);
    res.download(filePath, doc.originalName, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ success: false, message: 'File download failed' });
      }
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

// ── Award Workflow Controllers ─────────────────────────────────────────────────

export const getMyAwards = async (req, res) => {
  try {
    const awards = await tenderService.getMyAwards(req.user.organisationId);
    res.status(200).json({ success: true, data: awards });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const getAwardByTender = async (req, res) => {
  try {
    const award = await tenderService.getAwardByTender(req.params.id, req.user.organisationId);
    res.status(200).json({ success: true, data: award });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const initiateAwardPayment = async (req, res) => {
  try {
    const award = await tenderService.initiateAwardPayment(req.params.id, req.user.organisationId);
    res.status(200).json({ success: true, data: award });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const verifyAwardPayment = async (req, res) => {
  try {
    const award = await tenderService.verifyAwardPayment(req.params.id, req.user.organisationId);
    res.status(200).json({ success: true, data: award });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const dispatchTenderAward = async (req, res) => {
  try {
    const award = await tenderService.dispatchTenderAward(req.params.id, req.user.organisationId);
    res.status(200).json({ success: true, data: award });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const confirmTransfer = async (req, res) => {
  try {
    const award = await tenderService.confirmTransfer(
      req.params.id,
      req.user.organisationId,
      req.body,
      req.user.id
    );
    res.status(200).json({ success: true, data: award });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

export const importAwardToInventory = async (req, res) => {
  try {
    const record = await tenderService.importAwardToInventory(
      req.params.id,
      req.user.organisationId,
      req.user.id
    );
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};
