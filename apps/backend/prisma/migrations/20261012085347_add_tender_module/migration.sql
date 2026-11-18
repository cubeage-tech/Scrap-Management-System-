-- CreateEnum
CREATE TYPE "TenderStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'OPEN', 'CLOSED', 'UNDER_EVALUATION', 'AWARDED', 'UNSUCCESSFUL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TenderSubmissionStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ELIGIBLE', 'DISQUALIFIED', 'SELECTED', 'NOT_SELECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'TENDER_PUBLISHED';
ALTER TYPE "NotificationType" ADD VALUE 'TENDER_SUBMISSION_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'TENDER_EVALUATION_STARTED';
ALTER TYPE "NotificationType" ADD VALUE 'TENDER_AWARDED';
ALTER TYPE "NotificationType" ADD VALUE 'TENDER_NOT_AWARDED';
ALTER TYPE "NotificationType" ADD VALUE 'TENDER_CANCELLED';

-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "scrapRecordId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "terms" TEXT,
    "quantityKg" DECIMAL(65,30) NOT NULL,
    "reservePricePerKg" DECIMAL(65,30),
    "locationLabel" TEXT,
    "opensAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3) NOT NULL,
    "status" "TenderStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "evaluationStartedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderSubmission" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "pricePerKg" DECIMAL(65,30) NOT NULL,
    "totalValue" DECIMAL(65,30) NOT NULL,
    "note" TEXT,
    "paymentTerms" "PaymentTerms",
    "status" "TenderSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedByUserId" TEXT,
    "disqualificationReason" TEXT,
    "evaluationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderAward" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "finalPricePerKg" DECIMAL(65,30) NOT NULL,
    "finalTotalValue" DECIMAL(65,30) NOT NULL,
    "quantityKg" DECIMAL(65,30) NOT NULL,
    "selectionReason" TEXT,
    "awardedByUserId" TEXT,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentTerms" "PaymentTerms",
    "paymentDeadline" TIMESTAMP(3),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderAward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tender_ref_key" ON "Tender"("ref");

-- CreateIndex
CREATE INDEX "Tender_ownerId_status_idx" ON "Tender"("ownerId", "status");

-- CreateIndex
CREATE INDEX "Tender_scrapRecordId_idx" ON "Tender"("scrapRecordId");

-- CreateIndex
CREATE INDEX "Tender_status_closesAt_idx" ON "Tender"("status", "closesAt");

-- CreateIndex
CREATE INDEX "TenderSubmission_tenderId_status_idx" ON "TenderSubmission"("tenderId", "status");

-- CreateIndex
CREATE INDEX "TenderSubmission_dealerId_idx" ON "TenderSubmission"("dealerId");

-- CreateIndex
CREATE UNIQUE INDEX "TenderSubmission_tenderId_dealerId_key" ON "TenderSubmission"("tenderId", "dealerId");

-- CreateIndex
CREATE UNIQUE INDEX "TenderAward_tenderId_key" ON "TenderAward"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "TenderAward_submissionId_key" ON "TenderAward"("submissionId");

-- CreateIndex
CREATE INDEX "TenderAward_dealerId_idx" ON "TenderAward"("dealerId");

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_scrapRecordId_fkey" FOREIGN KEY ("scrapRecordId") REFERENCES "ScrapRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderSubmission" ADD CONSTRAINT "TenderSubmission_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderSubmission" ADD CONSTRAINT "TenderSubmission_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderSubmission" ADD CONSTRAINT "TenderSubmission_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderAward" ADD CONSTRAINT "TenderAward_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderAward" ADD CONSTRAINT "TenderAward_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "TenderSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderAward" ADD CONSTRAINT "TenderAward_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderAward" ADD CONSTRAINT "TenderAward_awardedByUserId_fkey" FOREIGN KEY ("awardedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
