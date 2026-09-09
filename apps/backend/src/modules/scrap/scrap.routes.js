import express from 'express';
import * as scrapController from './scrap.controller.js';
import requireAuth from '../../core/middlewares/auth.middleware.js';
import { allowRoles } from '../../core/middlewares/role.middleware.js';
import { validateCreateScrap, validateUpdateScrap } from './scrap.validation.js';

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

// 6. Import Purchased Sale to Inventory
router.post('/import-sale/:saleId', allowRoles('DEALER', 'BUYER'), scrapController.importSaleToInventory);

export default router;

