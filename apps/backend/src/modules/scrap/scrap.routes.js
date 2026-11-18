import express from 'express';
import * as scrapController from './scrap.controller.js';
import requireAuth from '../../core/middlewares/auth.middleware.js';
import { allowRoles } from '../../core/middlewares/role.middleware.js';
import { validateCreateScrap, validateUpdateScrap } from './scrap.validation.js';
import { uploadScrapImages } from '../../core/middlewares/upload.middleware.js';

const router = express.Router();

// Apply auth middleware to all scrap routes to ensure user is logged in
router.use(requireAuth);

// 1. Add Scrap
router.post('/', allowRoles('INDUSTRY', 'DEALER'), validateCreateScrap, scrapController.addScrap);

// 2. View/List Scrap
router.get('/', scrapController.getScraps);

// 3. View Scrap by ID
router.get('/:id', scrapController.getScrapById);

// 4. Update Scrap
router.put('/:id', allowRoles('INDUSTRY', 'DEALER'), validateUpdateScrap, scrapController.updateScrap);

// 5. Delete Scrap
router.delete('/:id', allowRoles('INDUSTRY', 'DEALER'), scrapController.deleteScrap);

// 6. Upload images for a scrap record (up to 5, max 5MB each)
router.post('/:id/images', allowRoles('INDUSTRY', 'DEALER'), uploadScrapImages, scrapController.uploadScrapImages);

// 7. Delete a specific image
router.delete('/:id/images/:imageId', allowRoles('INDUSTRY', 'DEALER'), scrapController.deleteScrapImage);

// 8. Import Purchased Sale to Inventory
router.post('/import-sale/:saleId', allowRoles('DEALER', 'BUYER'), scrapController.importSaleToInventory);

export default router;

