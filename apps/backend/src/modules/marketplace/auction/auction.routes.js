import express from 'express';
import * as auctionController from './auction.controller.js';
import { validateCreateAuction, validatePlaceBid } from './auction.validation.js';
import requireAuth from '../../../core/middlewares/auth.middleware.js';
import { allowRoles } from '../../../core/middlewares/role.middleware.js';

const router = express.Router();

router.use(requireAuth);

// Anyone can view auctions (or we can restrict, but typically authenticated users can view)
router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuctionById);

// Only INDUSTRY (or admins) can create and manage auctions
router.post('/', allowRoles('INDUSTRY', 'SUPER_ADMIN'), validateCreateAuction, auctionController.createAuction);
router.patch('/:id/start', allowRoles('INDUSTRY', 'SUPER_ADMIN'), auctionController.startAuction);
router.patch('/:id/close', allowRoles('INDUSTRY', 'SUPER_ADMIN'), auctionController.closeAuction);

// Only BUYER and DEALER can place bids
router.post('/:id/bid', allowRoles('BUYER', 'DEALER'), validatePlaceBid, auctionController.placeBid);

export default router;
