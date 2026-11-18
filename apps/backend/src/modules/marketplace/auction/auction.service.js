import prisma from '../../../core/lib/prisma.js';
import { notifyOutbid, notifyAuctionWon, notifyAuctionLost, notifyAuctionNoWinner, notifyWinnerSelected } from '../../notification/notification.service.js';


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

export const getAuctions = async (filters = {}) => {
  const where = {};
  if (filters.status) {
    if (filters.status.includes(',')) {
      where.status = { in: filters.status.split(',') };
    } else {
      where.status = filters.status;
    }
  }
  if (filters.listingId) where.listingId = filters.listingId;
  if (filters.ownerId) {
    where.listing = { scrapRecord: { ownerId: filters.ownerId } };
  }

  return await prisma.auction.findMany({
    where,
    include: {
      listing: { 
        include: { 
          scrapRecord: { 
            include: { 
              owner: { select: { companyName: true } },
              category: { select: { name: true } }
            } 
          } 
        } 
      },
      currentHighestBid: { select: { pricePerKg: true, totalValue: true, bidder: { select: { companyName: true } } } },
      winningBid: { select: { pricePerKg: true, totalValue: true, bidder: { select: { companyName: true } } } },
      bids: {
        include: { bidder: { select: { companyName: true } } },
        orderBy: { placedAt: 'desc' }
      }
    },
    orderBy: { startsAt: 'desc' }
  });
};

export const getAuctionById = async (id) => {
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      listing: { include: { scrapRecord: { include: { owner: { select: { companyName: true } }, category: { select: { name: true } } } } } },
      currentHighestBid: { select: { pricePerKg: true, totalValue: true, bidder: { select: { companyName: true } } } },
      winningBid: { select: { pricePerKg: true, totalValue: true, bidderId: true, bidder: { select: { companyName: true } } } },
      bids: {
        orderBy: { placedAt: 'desc' },
        include: { bidder: { select: { id: true, companyName: true } } }
      },
      sale: {
        include: {
          payment: { select: { id: true, status: true, amount: true, paidAt: true } },
          buyer: { select: { id: true, companyName: true } }
        }
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

  const now = new Date();
  const endsAt = auction.endsAt <= now
    ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
    : auction.endsAt;

  return await prisma.auction.update({
    where: { id },
    data: { status: 'LIVE', endsAt }
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

  const closedAt = new Date();
  let winningBidId = null;

  const result = await prisma.$transaction(async (tx) => {
    let finalStatus = 'CLOSED_NO_WINNER';

    if (auction.currentHighestBidId) {
      const winningBid = await tx.bid.findUnique({
        where: { id: auction.currentHighestBidId }
      });

      const meetsReserve = !auction.reservePricePerKg ||
        Number(winningBid.pricePerKg) >= Number(auction.reservePricePerKg);

      if (meetsReserve) {
        finalStatus = 'CLOSED_WITH_WINNER';
        winningBidId = auction.currentHighestBidId;

        await tx.bid.update({ where: { id: auction.currentHighestBidId }, data: { status: 'WON' } });
        await tx.bid.updateMany({
          where: { auctionId: id, id: { not: auction.currentHighestBidId } },
          data: { status: 'LOST' }
        });

        await tx.listing.update({ where: { id: auction.listingId }, data: { status: 'OFFER_ACCEPTED' } });

        const existingSale = await tx.sale.findUnique({ where: { auctionId: id } });
        if (!existingSale) {
          await tx.sale.create({
            data: {
              listingId: auction.listingId,
              bidId: winningBid.id,
              auctionId: id,
              sellerId: auction.listing.scrapRecord.ownerId,
              buyerId: winningBid.bidderId,
              quantityKg: auction.listing.quantityKg,
              pricePerKg: winningBid.pricePerKg,
              totalValue: winningBid.totalValue,
              status: 'PENDING_PAYMENT',
              paymentExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
          });
        }
      } else {
        await tx.bid.updateMany({ where: { auctionId: id }, data: { status: 'LOST' } });
        await tx.listing.update({ where: { id: auction.listingId }, data: { status: 'BIDDING_CLOSED', closedAt } });
      }
    } else {
      await tx.listing.update({ where: { id: auction.listingId }, data: { status: 'BIDDING_CLOSED', closedAt } });
    }

    return await tx.auction.update({
      where: { id },
      data: { status: finalStatus, winningBidId, closedAt }
    });
  });

  // Post-close notifications — non-blocking, never fail the response
  try {
    const materialName = auction.listing?.scrapRecord?.description || 'Scrap Lot';
    const allBids = await prisma.bid.findMany({
      where: { auctionId: id },
      select: { id: true, placedByUserId: true, pricePerKg: true, totalValue: true }
    });

    const industryUser = await prisma.user.findFirst({
      where: { organisationId: auction.listing.scrapRecord.ownerId, isActive: true }
    });
    if (industryUser) {
      if (winningBidId) {
        const wb = allBids.find(b => b.id === winningBidId);
        const winner = await prisma.bid.findUnique({
          where: { id: winningBidId },
          include: { bidder: { select: { companyName: true } } }
        });
        notifyWinnerSelected(industryUser.id, id, materialName, winner?.bidder?.companyName || 'A dealer', wb?.pricePerKg || 0).catch(() => {});
      } else {
        notifyAuctionNoWinner(industryUser.id, id, materialName).catch(() => {});
      }
    }

    const uniqueBidderUserIds = [...new Set(allBids.map(b => b.placedByUserId).filter(Boolean))];
    for (const userId of uniqueBidderUserIds) {
      const bid = allBids.find(b => b.placedByUserId === userId);
      if (bid?.id === winningBidId) {
        notifyAuctionWon(userId, id, materialName, bid.pricePerKg, bid.totalValue).catch(() => {});
      } else {
        notifyAuctionLost(userId, id, materialName).catch(() => {});
      }
    }
  } catch (err) {
    console.error('closeAuction notification error (non-fatal):', err.message);
  }

  return result;
};

export const placeBid = async (auctionId, data, userId, organisationId) => {
  return await prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: { listing: { include: { scrapRecord: true } } }
    });

    if (!auction) throw new Error('Auction not found');
    if (!['LIVE', 'EXTENDED'].includes(auction.status)) throw new Error('Auction is not currently active');

    // Belt-and-suspenders: reject bids that arrive after endsAt even if status wasn't updated yet
    if (auction.endsAt <= new Date()) {
      throw new Error('Auction bidding period has ended');
    }

    // Self-bid prevention — listing owner cannot bid on their own auction
    if (auction.listing.scrapRecord.ownerId === organisationId) {
      throw new Error('You cannot bid on your own listing');
    }

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

    // Track unique bidders for bidderCount
    const existingBidFromOrg = await tx.bid.findFirst({
      where: { auctionId, bidderId: organisationId }
    });
    const isNewBidder = !existingBidFromOrg;

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
      const prevBid = await tx.bid.findUnique({
        where: { id: auction.currentHighestBidId }
      });

      await tx.bid.update({
        where: { id: auction.currentHighestBidId },
        data: { status: 'OUTBID' }
      });

      if (prevBid?.placedByUserId && prevBid.placedByUserId !== userId) {
        try {
          await notifyOutbid(
            prevBid.placedByUserId,
            auctionId,
            auction.listing?.scrapRecord?.description || 'Auction Lot',
            bidPrice
          );
        } catch (err) {
          console.error('Error triggering outbid notification:', err);
        }
      }
    }


    // Update auction with new highest bid and extension logic
    const updatedAuction = await tx.auction.update({
      where: { id: auctionId },
      data: {
        currentHighestBidId: newBid.id,
        bidCount: { increment: 1 },
        ...(isNewBidder && { bidderCount: { increment: 1 } }),
        endsAt: newEndsAt,
        extensionCount: newExtensionCount,
        status: newStatus
      }
    });

    // Broadcast WebSocket real-time update
    try {
      const { io } = await import('../../../../server.js');
      if (io) {
        io.to(`auction:${auctionId}`).emit('bid:placed', {
          auctionId,
          bidPrice,
          totalValue,
          bidCount: updatedAuction.bidCount,
          endsAt: updatedAuction.endsAt,
          status: updatedAuction.status
        });

        io.emit('auctions:update', {
          auctionId,
          highestBid: bidPrice,
          status: updatedAuction.status
        });
      }
    } catch (e) {
      // Non-blocking socket broadcast
    }

    return newBid;
  });
};

export const cancelAuction = async (id, organisationId) => {
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: { listing: { include: { scrapRecord: true } } }
  });

  if (!auction) throw new Error('Auction not found');
  if (auction.listing.scrapRecord.ownerId !== organisationId) throw new Error('Unauthorized');
  if (!['SCHEDULED', 'LIVE', 'EXTENDED'].includes(auction.status)) {
    throw new Error('Auction can only be cancelled when SCHEDULED, LIVE, or EXTENDED');
  }

  return await prisma.$transaction(async (tx) => {
    await tx.auction.update({
      where: { id },
      data: { status: 'CANCELLED', closedAt: new Date() }
    });

    // Cancel all outstanding bids
    await tx.bid.updateMany({
      where: { auctionId: id, status: { in: ['PLACED', 'OUTBID', 'WINNING'] } },
      data: { status: 'CANCELLED' }
    });

    // Return listing to CANCELLED and restore inventory
    await tx.listing.update({
      where: { id: auction.listingId },
      data: { status: 'CANCELLED', closedAt: new Date() }
    });

    const qty = Number(auction.listing.quantityKg);
    const scrap = await tx.scrapRecord.findUnique({ where: { id: auction.listing.scrapRecordId } });
    const newListedQty = Math.max(0, Number(scrap.listedQuantityKg) - qty);
    const newAvailQty = Number(scrap.availableQuantityKg) + qty;
    let restoredStatus;
    if (newListedQty <= 0 && newAvailQty > 0) {
      restoredStatus = 'AVAILABLE';
    } else if (newAvailQty <= 0 && newListedQty > 0) {
      restoredStatus = 'FULLY_LISTED';
    } else {
      restoredStatus = 'PARTIALLY_LISTED';
    }

    await tx.scrapRecord.update({
      where: { id: auction.listing.scrapRecordId },
      data: {
        listedQuantityKg: newListedQty,
        availableQuantityKg: newAvailQty,
        status: restoredStatus
      }
    });

    return { id, status: 'CANCELLED', message: 'Auction cancelled and inventory restored' };
  });
};

export const getMyBids = async (organisationId) => {
  return await prisma.bid.findMany({
    where: { bidderId: organisationId },
    include: {
      auction: {
        include: {
          listing: {
            include: {
              scrapRecord: {
                include: {
                  category: { select: { name: true } },
                  owner: { select: { companyName: true } }
                }
              }
            }
          },
          winningBid: { select: { id: true, pricePerKg: true } }
        }
      }
    },
    orderBy: { placedAt: 'desc' }
  });
};

export const getAuctionBids = async (auctionId) => {
  const auction = await prisma.auction.findUnique({ where: { id: auctionId } });
  if (!auction) throw new Error('Auction not found');

  return await prisma.bid.findMany({
    where: { auctionId },
    include: {
      bidder: { select: { id: true, companyName: true } }
    },
    orderBy: { placedAt: 'desc' }
  });
};

