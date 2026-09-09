import prisma from '../../../core/lib/prisma.js';

export const createAuction = async (data, organisationId) => {
  // Validate listing
  const listing = await prisma.listing.findUnique({
    where: { id: data.listingId },
    include: { scrapRecord: true }
  });

  if (!listing) throw new Error('Listing not found');
  if (listing.scrapRecord.ownerId !== organisationId) {
    throw new Error('Unauthorized to create auction for this listing');
  }
  if (listing.sellingMode !== 'AUCTION') {
    throw new Error('Listing selling mode is not AUCTION');
  }
  
  // Check if auction already exists for this listing
  const existingAuction = await prisma.auction.findUnique({
    where: { listingId: data.listingId }
  });
  if (existingAuction) throw new Error('Auction already exists for this listing');

  return await prisma.auction.create({
    data: {
      listingId: data.listingId,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      startingPricePerKg: data.startingPricePerKg,
      reservePricePerKg: data.reservePricePerKg,
      minIncrement: data.minIncrement,
      extensionWindowMin: data.extensionWindowMin || 5,
      extensionMinutes: data.extensionMinutes || 5,
      status: 'SCHEDULED'
    }
  });
};

export const getAuctions = async (filters) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.listingId) where.listingId = filters.listingId;

  return await prisma.auction.findMany({
    where,
    include: {
      listing: { include: { scrapRecord: { include: { owner: { select: { companyName: true } } } } } },
      currentHighestBid: { select: { pricePerKg: true, bidder: { select: { companyName: true } } } }
    },
    orderBy: { startsAt: 'desc' }
  });
};

export const getAuctionById = async (id) => {
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      listing: { include: { scrapRecord: { include: { owner: { select: { companyName: true } } } } } },
      currentHighestBid: { select: { pricePerKg: true, bidder: { select: { companyName: true } } } },
      bids: { 
        orderBy: { placedAt: 'desc' },
        include: { bidder: { select: { companyName: true } } }
      }
    }
  });
  if (!auction) throw new Error('Auction not found');
  return auction;
};

export const startAuction = async (id, organisationId) => {
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: { listing: { include: { scrapRecord: true } } }
  });

  if (!auction) throw new Error('Auction not found');
  if (auction.listing.scrapRecord.ownerId !== organisationId) throw new Error('Unauthorized');
  if (auction.status !== 'SCHEDULED') throw new Error('Can only start SCHEDULED auctions');

  return await prisma.auction.update({
    where: { id },
    data: { status: 'LIVE' }
  });
};

export const closeAuction = async (id, organisationId) => {
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: { listing: { include: { scrapRecord: true } } }
  });

  if (!auction) throw new Error('Auction not found');
  if (auction.listing.scrapRecord.ownerId !== organisationId) throw new Error('Unauthorized');
  if (!['LIVE', 'EXTENDED'].includes(auction.status)) throw new Error('Auction is not active');

  // Determine winner
  const newStatus = auction.currentHighestBidId ? 'CLOSED_WITH_WINNER' : 'CLOSED_NO_WINNER';
  const closedAt = new Date();

  return await prisma.$transaction(async (tx) => {
    const updatedAuction = await tx.auction.update({
      where: { id },
      data: {
        status: newStatus,
        winningBidId: auction.currentHighestBidId,
        closedAt
      }
    });

    if (auction.currentHighestBidId) {
      await tx.bid.update({
        where: { id: auction.currentHighestBidId },
        data: { status: 'WINNING' } // Or WON
      });
      // Optionally update listing status
      await tx.listing.update({
        where: { id: auction.listingId },
        data: { status: 'BIDDING_CLOSED' }
      });
    }

    return updatedAuction;
  });
};

export const placeBid = async (auctionId, data, userId, organisationId) => {
  return await prisma.$transaction(async (tx) => {
    // Lock the auction row (pseudo-lock for concurrent safety via transaction isolation)
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: { listing: true }
    });

    if (!auction) throw new Error('Auction not found');
    if (!['LIVE', 'EXTENDED'].includes(auction.status)) throw new Error('Auction is not currently active');
    
    const bidPrice = Number(data.pricePerKg);

    // Ensure bid is higher than starting price
    if (bidPrice < Number(auction.startingPricePerKg)) {
      throw new Error(`Bid must be at least the starting price of ${auction.startingPricePerKg}`);
    }

    // Ensure bid is higher than current highest bid by minIncrement
    if (auction.currentHighestBidId) {
      const highestBid = await tx.bid.findUnique({ where: { id: auction.currentHighestBidId } });
      const minRequired = Number(highestBid.pricePerKg) + Number(auction.minIncrement);
      if (bidPrice < minRequired) {
        throw new Error(`Bid must be at least ${minRequired} (current highest + min increment)`);
      }
    }

    // Auto-extension logic
    const now = new Date();
    const timeRemainingMs = auction.endsAt.getTime() - now.getTime();
    const extensionWindowMs = auction.extensionWindowMin * 60 * 1000;
    
    let newEndsAt = auction.endsAt;
    let newExtensionCount = auction.extensionCount;
    let newStatus = auction.status;

    if (timeRemainingMs > 0 && timeRemainingMs <= extensionWindowMs) {
      newEndsAt = new Date(auction.endsAt.getTime() + (auction.extensionMinutes * 60 * 1000));
      newExtensionCount += 1;
      newStatus = 'EXTENDED';
    }

    // Calculate total value
    const totalValue = bidPrice * Number(auction.listing.quantityKg);

    // Create the new bid
    const newBid = await tx.bid.create({
      data: {
        auctionId,
        bidderId: organisationId,
        pricePerKg: bidPrice,
        totalValue: totalValue,
        sequence: auction.bidCount + 1,
        status: 'PLACED',
        placedByUserId: userId
      }
    });

    // Update previous highest bid to OUTBID
    if (auction.currentHighestBidId) {
      await tx.bid.update({
        where: { id: auction.currentHighestBidId },
        data: { status: 'OUTBID' }
      });
    }

    // Update auction with new highest bid and extension logic
    await tx.auction.update({
      where: { id: auctionId },
      data: {
        currentHighestBidId: newBid.id,
        bidCount: { increment: 1 },
        endsAt: newEndsAt,
        extensionCount: newExtensionCount,
        status: newStatus
      }
    });

    return newBid;
  });
};
