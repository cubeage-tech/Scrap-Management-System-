import express from 'express';
import * as paymentController from './payment.controller.js';
import requireAuth from '../../../core/middlewares/auth.middleware.js';
import { allowRoles } from '../../../core/middlewares/role.middleware.js';

const router = express.Router();

// Webhook — no auth, called by payment gateway
// Must be registered BEFORE the requireAuth middleware below
router.post('/webhook', paymentController.handleWebhook);

// All other routes require authentication
router.use(requireAuth);

// Buyer initiates payment for a sale (no amount in body — server uses sale.totalValue)
router.post('/initiate', allowRoles('DEALER', 'BUYER'), paymentController.initiatePayment);

// Buyer verifies / confirms payment (MANUAL mode; real gateway uses webhook instead)
router.post('/verify', allowRoles('DEALER', 'BUYER'), paymentController.verifyPayment);

// Get payment status for a sale (buyer or seller)
router.get('/:saleId', allowRoles('INDUSTRY', 'DEALER', 'BUYER', 'SUPER_ADMIN'), paymentController.getPaymentBySaleId);

// Refund a completed payment (seller or SUPER_ADMIN)
router.post('/:paymentId/refund', allowRoles('INDUSTRY', 'DEALER', 'SUPER_ADMIN'), paymentController.refundPayment);

export default router;
