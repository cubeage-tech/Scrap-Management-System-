import * as scrapService from './scrap.service.js';

// 1. Add Scrap
export const addScrap = async (req, res) => {
  try {
    // Extract IDs from the authenticated user token (set by auth.middleware)
    const userId = req.user.id || req.user.userId;
    const organisationId = req.user.organisationId;

    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'User must belong to an organisation to add scrap' });
    }

    const newScrap = await scrapService.createScrap(req.body, userId, organisationId);
    res.status(201).json({ success: true, data: newScrap, message: 'Scrap added successfully' });
  } catch (error) {
    console.error('Error adding scrap:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. View/List Scrap
export const getScraps = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'Unauthorised' });
    }

    const scraps = await scrapService.getScraps(organisationId);
    res.status(200).json({ success: true, data: scraps });
  } catch (error) {
    console.error('Error fetching scraps:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 3. View Scrap by ID
export const getScrapById = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const scrap = await scrapService.getScrapById(req.params.id, organisationId);
    
    if (!scrap) {
      return res.status(404).json({ success: false, message: 'Scrap not found' });
    }
    
    res.status(200).json({ success: true, data: scrap });
  } catch (error) {
    console.error('Error fetching scrap by ID:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 4. Update Scrap
export const updateScrap = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const updatedScrap = await scrapService.updateScrap(req.params.id, req.body, organisationId);
    
    res.status(200).json({ success: true, data: updatedScrap, message: 'Scrap updated successfully' });
  } catch (error) {
    console.error('Error updating scrap:', error);
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

// 5. Delete Scrap
export const deleteScrap = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    await scrapService.deleteScrap(req.params.id, organisationId);
    
    res.status(200).json({ success: true, message: 'Scrap deleted successfully' });
  } catch (error) {
    console.error('Error deleting scrap:', error);
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

// 6. Import Purchased Sale to Inventory
export const importSaleToInventory = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const organisationId = req.user.organisationId;
    const { saleId } = req.params;

    if (!organisationId) {
      return res.status(403).json({ success: false, message: 'User must belong to an organisation' });
    }

    const scrap = await scrapService.convertSaleToInventory(saleId, organisationId, userId);
    res.status(201).json({ success: true, data: scrap, message: 'Sale imported to inventory successfully' });
  } catch (error) {
    console.error('Error importing sale to inventory:', error);
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};
