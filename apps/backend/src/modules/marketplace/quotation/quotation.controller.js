import * as quotationService from './quotation.service.js';

export const createQuotation = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const organisationId = req.user.organisationId;

    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'User must belong to an organisation' });
    }

    const quotation = await quotationService.createQuotation(req.body, userId, organisationId);
    res.status(201).json({ success: true, data: quotation, message: 'Quotation submitted successfully' });
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

export const getQuotations = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const role = req.user.role; // e.g. INDUSTRY, BUYER, DEALER

    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'User must belong to an organisation' });
    }

    const filters = req.validatedQuery || {};

    const quotations = await quotationService.getQuotations(filters, organisationId, role);
    res.status(200).json({ success: true, data: quotations });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

export const getQuotationById = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const role = req.user.role;

    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'User must belong to an organisation' });
    }

    const quotation = await quotationService.getQuotationById(req.params.id, organisationId, role);
    res.status(200).json({ success: true, data: quotation });
  } catch (error) {
    console.error('Error fetching quotation by ID:', error);
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

export const acceptQuotation = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;

    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'User must belong to an organisation' });
    }

    const quotation = await quotationService.acceptQuotation(req.params.id, organisationId);
    res.status(200).json({ success: true, data: quotation, message: 'Quotation accepted' });
  } catch (error) {
    console.error('Error accepting quotation:', error);
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

export const rejectQuotation = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;

    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'User must belong to an organisation' });
    }

    const quotation = await quotationService.rejectQuotation(req.params.id, organisationId);
    res.status(200).json({ success: true, data: quotation, message: 'Quotation rejected' });
  } catch (error) {
    console.error('Error rejecting quotation:', error);
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

export const withdrawQuotation = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;

    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'User must belong to an organisation' });
    }

    const quotation = await quotationService.withdrawQuotation(req.params.id, organisationId);
    res.status(200).json({ success: true, data: quotation, message: 'Quotation withdrawn' });
  } catch (error) {
    console.error('Error withdrawing quotation:', error);
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};
