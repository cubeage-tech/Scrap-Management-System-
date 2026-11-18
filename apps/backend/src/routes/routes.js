import express from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import listingRoutes from '../modules/marketplace/listings/listing.routes.js';
import quotationRoutes from '../modules/marketplace/quotation/quotation.routes.js';
import auctionRoutes from '../modules/marketplace/auction/auction.routes.js';
import scrapRoutes from '../modules/scrap/scrap.routes.js';
import categoryRoutes from '../modules/category/category.routes.js';
import reportsRoutes from '../modules/reports/reports.routes.js';
import saleRoutes from '../modules/marketplace/sale/sale.routes.js';
import paymentRoutes from '../modules/marketplace/payment/payment.routes.js';
import industryRoutes from '../modules/industry/industry.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';
import tenderRoutes from '../modules/marketplace/tender/tender.routes.js';
import { authRateLimiter, apiRateLimiter } from '../core/middlewares/rateLimiter.js';

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'ok' }));

// Apply Rate Limiters for Security & DDOS Protection
router.use('/auth', authRateLimiter, authRoutes);
router.use('/admin', apiRateLimiter, adminRoutes);
router.use('/industry', apiRateLimiter, industryRoutes);
router.use('/marketplace/listings', apiRateLimiter, listingRoutes);
router.use('/marketplace/quotations', apiRateLimiter, quotationRoutes);
router.use('/marketplace/auctions', apiRateLimiter, auctionRoutes);
router.use('/marketplace/sales', apiRateLimiter, saleRoutes);
router.use('/marketplace/payments', paymentRoutes);
router.use('/scrap', apiRateLimiter, scrapRoutes);
router.use('/category', apiRateLimiter, categoryRoutes);
router.use('/categories', apiRateLimiter, categoryRoutes);
router.use('/reports', apiRateLimiter, reportsRoutes);
router.use('/notifications', apiRateLimiter, notificationRoutes);
router.use('/marketplace/tenders', apiRateLimiter, tenderRoutes);

export default router;

