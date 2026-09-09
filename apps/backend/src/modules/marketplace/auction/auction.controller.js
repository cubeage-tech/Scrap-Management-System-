import * as auctionService from './auction.service.js';

export const createAuction = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    if (!organisationId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const auction = await auctionService.createAuction(req.body, organisationId);
    res.status(201).json({ success: true, data: auction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAuctions = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      listingId: req.query.listingId
    };
    const auctions = await auctionService.getAuctions(filters);
    res.status(200).json({ success: true, data: auctions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAuctionById = async (req, res) => {
  try {
    const auction = await auctionService.getAuctionById(req.params.id);
    res.status(200).json({ success: true, data: auction });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const startAuction = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const auction = await auctionService.startAuction(req.params.id, organisationId);
    res.status(200).json({ success: true, data: auction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const closeAuction = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const auction = await auctionService.closeAuction(req.params.id, organisationId);
    res.status(200).json({ success: true, data: auction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const placeBid = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const organisationId = req.user.organisationId;
    if (!organisationId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const bid = await auctionService.placeBid(req.params.id, req.body, userId, organisationId);
    res.status(201).json({ success: true, data: bid, message: 'Bid placed successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
