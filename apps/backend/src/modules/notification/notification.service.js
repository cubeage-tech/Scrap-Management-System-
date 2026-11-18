import prisma from "../../core/lib/prisma.js";

/**
 * Core Notification Service
 */

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  entityType = null,
  entityId = null,
}) => {
  if (!userId) return null;

  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        entityType,
        entityId,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

export const getUserNotifications = async (userId, options = {}) => {
  const { isRead, page = 1, limit = 20 } = options;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;

  const where = { userId };
  if (typeof isRead === "boolean") {
    where.isRead = isRead;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

// =========================================================
// HELPER DOMAIN EVENT EMITTERS
// =========================================================

export const notifyAccountApproved = async (userId, companyName) => {
  return await createNotification({
    userId,
    type: "ACCOUNT_APPROVED",
    title: "Account Approved",
    message: `Congratulations! Your organization (${companyName}) has been approved. You can now access marketplace features.`,
    entityType: "ORGANISATION",
  });
};

export const notifyAccountRejected = async (userId, companyName, reason) => {
  return await createNotification({
    userId,
    type: "ACCOUNT_REJECTED",
    title: "Account Registration Update",
    message: `Your organization registration (${companyName}) was not approved. ${reason ? `Reason: ${reason}` : ""}`,
    entityType: "ORGANISATION",
  });
};

export const notifyQuotationReceived = async (userId, quotationId, materialName, pricePerKg) => {
  return await createNotification({
    userId,
    type: "OFFER_RECEIVED",
    title: "New Quotation Received",
    message: `A new quotation of ₹${pricePerKg}/kg was submitted for your listing (${materialName}).`,
    entityType: "QUOTATION",
    entityId: quotationId,
  });
};

export const notifyQuotationAccepted = async (userId, quotationId, materialName) => {
  return await createNotification({
    userId,
    type: "OFFER_ACCEPTED",
    title: "Quotation Accepted!",
    message: `Your quotation for ${materialName} was ACCEPTED. A new sales order has been created.`,
    entityType: "QUOTATION",
    entityId: quotationId,
  });
};

export const notifyQuotationRejected = async (userId, quotationId, materialName) => {
  return await createNotification({
    userId,
    type: "OFFER_REJECTED",
    title: "Quotation Update",
    message: `Your quotation for ${materialName} was REJECTED by the seller.`,
    entityType: "QUOTATION",
    entityId: quotationId,
  });
};

export const notifySaleCompleted = async (userId, saleId, materialName, totalValue) => {
  return await createNotification({
    userId,
    type: "SALE_COMPLETED",
    title: "Order Completed",
    message: `Your purchase of ${materialName} (₹${Number(totalValue).toLocaleString("en-IN")}) has been confirmed. The seller has marked it as paid and ready.`,
    entityType: "SALE",
    entityId: saleId,
  });
};

export const notifyOutbid = async (userId, auctionId, materialName, newHighestBid) => {
  return await createNotification({
    userId,
    type: "OUTBID",
    title: "You Have Been Outbid!",
    message: `Another bidder placed a higher bid of ₹${newHighestBid}/kg on ${materialName}.`,
    entityType: "AUCTION",
    entityId: auctionId,
  });
};

export const notifyAuctionWon = async (userId, auctionId, materialName, winningBid, totalValue) => {
  return await createNotification({
    userId,
    type: "AUCTION_WON",
    title: "Congratulations — You Won the Auction!",
    message: `Your bid of ₹${winningBid}/kg (total ₹${Number(totalValue).toLocaleString('en-IN')}) won the auction for ${materialName}. Please proceed with payment.`,
    entityType: "AUCTION",
    entityId: auctionId,
  });
};

export const notifyAuctionLost = async (userId, auctionId, materialName) => {
  return await createNotification({
    userId,
    type: "AUCTION_LOST",
    title: "Auction Result",
    message: `The auction for ${materialName} has been awarded to another bidder. Better luck next time.`,
    entityType: "AUCTION",
    entityId: auctionId,
  });
};

export const notifyAuctionNoWinner = async (userId, auctionId, materialName) => {
  return await createNotification({
    userId,
    type: "AUCTION_NO_WINNER",
    title: "Auction Closed — No Qualifying Bids",
    message: `The auction for ${materialName} closed with no qualifying bids meeting the reserve price.`,
    entityType: "AUCTION",
    entityId: auctionId,
  });
};

export const notifyWinnerSelected = async (userId, auctionId, materialName, winnerName, winningBid) => {
  return await createNotification({
    userId,
    type: "WINNER_SELECTED",
    title: "Auction Awarded",
    message: `Your auction for ${materialName} has been awarded to ${winnerName} at ₹${winningBid}/kg. Payment is now pending.`,
    entityType: "AUCTION",
    entityId: auctionId,
  });
};

