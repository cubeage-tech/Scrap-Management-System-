-- CreateEnum: TransferStatus
-- Safe migration: uses ALTER COLUMN ... USING to cast existing text values to enum.
-- Existing values "PENDING" and "COMPLETED" are valid enum members; NULLs pass through unchanged.
-- No rows are dropped or recreated.

CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'DISPATCHED', 'IN_TRANSIT', 'COMPLETED');

-- AlterTable: cast existing text column to the new enum type
ALTER TABLE "TenderAward"
  ALTER COLUMN "transferStatus" TYPE "TransferStatus"
  USING "transferStatus"::"TransferStatus";

-- Set the column default for new rows
ALTER TABLE "TenderAward"
  ALTER COLUMN "transferStatus" SET DEFAULT 'PENDING'::"TransferStatus";
