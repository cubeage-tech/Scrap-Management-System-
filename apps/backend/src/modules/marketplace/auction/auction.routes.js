import express from 'express';
import * as auctionController from './auction.controller.js';
import { validateCreateAuction, validatePlaceBid } from './auction.validation.js';
import requireAuth from '../../../core/middlewares/auth.middleware.js';
import { allowRoles } from '../../../core/middlewares/role.middleware.js';

const router = express.Router();

router.use(requireAuth);

// Dealer/Buyer: view their own bids (must be before /:id to avoid param conflict)
router.get('/bids/my', allowRoles('DEALER', 'BUYER'), auctionController.getMyBids);

// Anyone authenticated can view auctions
router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuctionById);
router.get('/:id/bids', auctionController.getAuctionBids);

// Only INDUSTRY (or admins) can create and manage auctions
router.post('/', allowRoles('INDUSTRY', 'SUPER_ADMIN'), validateCreateAuction, auctionController.createAuction);
router.patch('/:id/start', allowRoles('INDUSTRY', 'SUPER_ADMIN'), auctionController.startAuction);
router.patch('/:id/close', allowRoles('INDUSTRY', 'SUPER_ADMIN'), auctionController.closeAuction);
router.patch('/:id/cancel', allowRoles('INDUSTRY', 'SUPER_ADMIN'), auctionController.cancelAuction);

// Only DEALER can place bids (not BUYER — procurement is Industry→Dealer)
router.post('/:id/bid', allowRoles('DEALER'), validatePlaceBid, auctionController.placeBid);

export default router;
