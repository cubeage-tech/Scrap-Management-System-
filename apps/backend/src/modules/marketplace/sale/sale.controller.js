import * as saleService from './sale.service.js';

export const completeSale = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const userId = req.user.id;
    if (!organisationId) return res.status(403).json({ success: false, message: 'Organisation ID is required' });
    const sale = await saleService.completeSale(req.params.id, organisationId, userId);
    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    console.error('Error completing sale:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getSales = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const role = req.user.role;
    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'Organisation ID is required' });
    }

    const data = await saleService.getSales(organisationId, role, req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'Organisation ID is required' });
    }

    const sale = await saleService.getSaleById(req.params.id, organisationId);
    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    console.error('Error fetching sale details:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateDelivery = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    if (!organisationId) return res.status(403).json({ success: false, message: 'Organisation ID is required' });
    const sale = await saleService.updateDelivery(req.params.id, req.body, organisationId);
    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateSaleStatus = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const userId = req.user.id;
    const { status } = req.body;

    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'Organisation ID is required' });
    }
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updatedSale = await saleService.updateSaleStatus(req.params.id, status, userId, organisationId);
    res.status(200).json({ success: true, data: updatedSale });
  } catch (error) {
    console.error('Error updating sale status:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

