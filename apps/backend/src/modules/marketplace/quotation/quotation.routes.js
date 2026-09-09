import express from 'express';
import * as quotationController from './quotation.controller.js';
import { validateCreateQuotation, validateGetQuotations } from './quotation.validation.js';
import requireAuth from '../../../core/middlewares/auth.middleware.js';
import { allowRoles } from '../../../core/middlewares/role.middleware.js';

const router = express.Router();

// All quotation routes require authentication
router.use(requireAuth);

// 1. Create Quotation (buyer-side action)
router.post('/', allowRoles('DEALER', 'BUYER'), validateCreateQuotation, quotationController.createQuotation);

// 2. Get Quotations
router.get('/', validateGetQuotations, quotationController.getQuotations);

// 3. Get Quotation By ID
router.get('/:id', quotationController.getQuotationById);

// 4. Accept Quotation (seller/listing-owner action)
router.patch('/:id/accept', allowRoles('INDUSTRY', 'DEALER'), quotationController.acceptQuotation);

// 5. Reject Quotation (seller/listing-owner action)
router.patch('/:id/reject', allowRoles('INDUSTRY', 'DEALER'), quotationController.rejectQuotation);

// 6. Withdraw Quotation (buyer-side action)
router.patch('/:id/withdraw', allowRoles('DEALER', 'BUYER'), quotationController.withdrawQuotation);

export default router;
