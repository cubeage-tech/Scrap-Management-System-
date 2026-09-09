-- CreateEnum
CREATE TYPE "SellingMode" AS ENUM ('QUOTATION', 'AUCTION', 'TENDER');

-- CreateEnum
CREATE TYPE "ScrapStatus" AS ENUM ('AVAILABLE', 'PARTIALLY_LISTED', 'FULLY_LISTED', 'SOLD_OUT');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'BIDDING_CLOSED', 'OFFER_ACCEPTED', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'EXTENDED', 'CLOSED_WITH_WINNER', 'CLOSED_NO_WINNER', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PLACED', 'OUTBID', 'WINNING', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('ACCEPTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentTerms" AS ENUM ('ADVANCE', 'ON_PICKUP', 'DAYS_15', 'DAYS_30', 'DAYS_45');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ACCOUNT_APPROVED', 'ACCOUNT_REJECTED', 'NEW_REGISTRATION', 'LISTING_PUBLISHED', 'OFFER_RECEIVED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'OFFER_WITHDRAWN', 'OUTBID', 'AUCTION_STARTING', 'AUCTION_EXTENDED', 'AUCTION_WON', 'AUCTION_LOST', 'AUCTION_NO_WINNER', 'TENDER_REVEALED', 'LISTING_EXPIRED', 'SALE_ACCEPTED', 'SALE_COMPLETED', 'INVENTORY_ADDED', 'INVENTORY_UPDATED');

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "approvedByUserId" TEXT;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerInterest" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyerInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapRecord" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "description" TEXT,
    "condition" TEXT,
    "locationLabel" TEXT,
    "totalQuantityKg" DECIMAL(65,30) NOT NULL,
    "listedQuantityKg" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "soldQuantityKg" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "availableQuantityKg" DECIMAL(65,30) NOT NULL,
    "status" "ScrapStatus" NOT NULL DEFAULT 'AVAILABLE',
    "sourceSaleId" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapImage" (
    "id" TEXT NOT NULL,
    "scrapRecordId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "scrapRecordId" TEXT NOT NULL,
    "sellingMode" "SellingMode" NOT NULL,
    "quantityKg" DECIMAL(65,30) NOT NULL,
    "expectedPricePerKg" DECIMAL(65,30),
    "closesAt" TIMESTAMP(3),
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "pricePerKg" DECIMAL(65,30) NOT NULL,
    "quantityKg" DECIMAL(65,30) NOT NULL,
    "totalValue" DECIMAL(65,30) NOT NULL,
    "paymentTerms" "PaymentTerms",
    "note" TEXT,
    "isSealed" BOOLEAN NOT NULL DEFAULT false,
    "revealedAt" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "status" "QuotationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "startingPricePerKg" DECIMAL(65,30) NOT NULL,
    "reservePricePerKg" DECIMAL(65,30),
    "minIncrement" DECIMAL(65,30) NOT NULL,
    "extensionWindowMin" INTEGER NOT NULL DEFAULT 5,
    "extensionMinutes" INTEGER NOT NULL DEFAULT 5,
    "extensionCount" INTEGER NOT NULL DEFAULT 0,
    "status" "AuctionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "currentHighestBidId" TEXT,
    "winningBidId" TEXT,
    "bidCount" INTEGER NOT NULL DEFAULT 0,
    "bidderCount" INTEGER NOT NULL DEFAULT 0,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "pricePerKg" DECIMAL(65,30) NOT NULL,
    "totalValue" DECIMAL(65,30) NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'PLACED',
    "placedByUserId" TEXT,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "quotationId" TEXT,
    "bidId" TEXT,
    "auctionId" TEXT,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerType" "BusinessType",
    "quantityKg" DECIMAL(65,30) NOT NULL,
    "pricePerKg" DECIMAL(65,30) NOT NULL,
    "totalValue" DECIMAL(65,30) NOT NULL,
    "commissionRate" DECIMAL(65,30),
    "commissionAmount" DECIMAL(65,30),
    "status" "SaleStatus" NOT NULL DEFAULT 'ACCEPTED',
    "acceptedByUserId" TEXT,
    "completedByUserId" TEXT,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionSetting" (
    "id" TEXT NOT NULL,
    "sellerType" "BusinessType" NOT NULL,
    "ratePercent" DECIMAL(65,30) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT,
    "message" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");

-- CreateIndex
CREATE INDEX "BuyerInterest_organisationId_idx" ON "BuyerInterest"("organisationId");

-- CreateIndex
CREATE INDEX "BuyerInterest_categoryId_idx" ON "BuyerInterest"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerInterest_organisationId_categoryId_key" ON "BuyerInterest"("organisationId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapRecord_sourceSaleId_key" ON "ScrapRecord"("sourceSaleId");

-- CreateIndex
CREATE INDEX "ScrapRecord_ownerId_status_idx" ON "ScrapRecord"("ownerId", "status");

-- CreateIndex
CREATE INDEX "ScrapRecord_categoryId_idx" ON "ScrapRecord"("categoryId");

-- CreateIndex
CREATE INDEX "ScrapRecord_sourceSaleId_idx" ON "ScrapRecord"("sourceSaleId");

-- CreateIndex
CREATE INDEX "ScrapImage_scrapRecordId_idx" ON "ScrapImage"("scrapRecordId");

-- CreateIndex
CREATE INDEX "Listing_scrapRecordId_idx" ON "Listing"("scrapRecordId");

-- CreateIndex
CREATE INDEX "Listing_status_sellingMode_idx" ON "Listing"("status", "sellingMode");

-- CreateIndex
CREATE INDEX "Listing_status_closesAt_idx" ON "Listing"("status", "closesAt");

-- CreateIndex
CREATE INDEX "Quotation_listingId_status_idx" ON "Quotation"("listingId", "status");

-- CreateIndex
CREATE INDEX "Quotation_buyerId_status_idx" ON "Quotation"("buyerId", "status");

-- CreateIndex
CREATE INDEX "Quotation_listingId_idx" ON "Quotation"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_listingId_key" ON "Auction"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_currentHighestBidId_key" ON "Auction"("currentHighestBidId");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_winningBidId_key" ON "Auction"("winningBidId");

-- CreateIndex
CREATE INDEX "Auction_status_startsAt_idx" ON "Auction"("status", "startsAt");

-- CreateIndex
CREATE INDEX "Auction_status_endsAt_idx" ON "Auction"("status", "endsAt");

-- CreateIndex
CREATE INDEX "Bid_auctionId_pricePerKg_idx" ON "Bid"("auctionId", "pricePerKg");

-- CreateIndex
CREATE INDEX "Bid_bidderId_idx" ON "Bid"("bidderId");

-- CreateIndex
CREATE INDEX "Bid_placedAt_idx" ON "Bid"("placedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Bid_auctionId_sequence_key" ON "Bid"("auctionId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_listingId_key" ON "Sale"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_quotationId_key" ON "Sale"("quotationId");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_bidId_key" ON "Sale"("bidId");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_auctionId_key" ON "Sale"("auctionId");

-- CreateIndex
CREATE INDEX "Sale_sellerId_status_idx" ON "Sale"("sellerId", "status");

-- CreateIndex
CREATE INDEX "Sale_buyerId_status_idx" ON "Sale"("buyerId", "status");

-- CreateIndex
CREATE INDEX "Sale_completedAt_idx" ON "Sale"("completedAt");

-- CreateIndex
CREATE INDEX "CommissionSetting_sellerType_effectiveFrom_idx" ON "CommissionSetting"("sellerType", "effectiveFrom");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- AddForeignKey
ALTER TABLE "Organisation" ADD CONSTRAINT "Organisation_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerInterest" ADD CONSTRAINT "BuyerInterest_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerInterest" ADD CONSTRAINT "BuyerInterest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapRecord" ADD CONSTRAINT "ScrapRecord_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapRecord" ADD CONSTRAINT "ScrapRecord_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapRecord" ADD CONSTRAINT "ScrapRecord_sourceSaleId_fkey" FOREIGN KEY ("sourceSaleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapRecord" ADD CONSTRAINT "ScrapRecord_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapImage" ADD CONSTRAINT "ScrapImage_scrapRecordId_fkey" FOREIGN KEY ("scrapRecordId") REFERENCES "ScrapRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_scrapRecordId_fkey" FOREIGN KEY ("scrapRecordId") REFERENCES "ScrapRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_currentHighestBidId_fkey" FOREIGN KEY ("currentHighestBidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_winningBidId_fkey" FOREIGN KEY ("winningBidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_placedByUserId_fkey" FOREIGN KEY ("placedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_completedByUserId_fkey" FOREIGN KEY ("completedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionSetting" ADD CONSTRAINT "CommissionSetting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
