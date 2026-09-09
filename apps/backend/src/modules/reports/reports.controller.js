import * as reportsService from './reports.service.js';

export const getIndustryReports = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'Organisation ID is required' });
    }
    const data = await reportsService.getIndustryReports(organisationId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching industry reports:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDealerReports = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'Organisation ID is required' });
    }
    const data = await reportsService.getDealerReports(organisationId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching dealer reports:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBuyerReports = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'Organisation ID is required' });
    }
    const data = await reportsService.getBuyerReports(organisationId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching buyer reports:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminReports = async (req, res) => {
  try {
    const data = await reportsService.getAdminReports();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching admin reports:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

