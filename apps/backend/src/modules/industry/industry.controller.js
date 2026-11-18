import * as industryService from './industry.service.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'Organisation ID is required' });
    }

    const data = await industryService.getIndustryDashboardAnalytics(organisationId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching industry dashboard analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

