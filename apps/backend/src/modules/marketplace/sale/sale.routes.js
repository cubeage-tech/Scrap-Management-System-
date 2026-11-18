import express from 'express';
import * as saleController from './sale.controller.js';
import requireAuth from '../../../core/middlewares/auth.middleware.js';
import { allowRoles } from '../../../core/middlewares/role.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', saleController.getSales);
router.get('/:id', saleController.getSaleById);
router.patch('/:id/status', allowRoles('INDUSTRY', 'DEALER', 'SUPER_ADMIN'), saleController.updateSaleStatus);
router.post('/:id/complete', allowRoles('INDUSTRY', 'DEALER'), saleController.completeSale);
router.patch('/:id/delivery', allowRoles('INDUSTRY'), saleController.updateDelivery);

export default router;

