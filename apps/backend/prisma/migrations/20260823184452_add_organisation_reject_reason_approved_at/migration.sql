-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "rejectReason" TEXT;
