/*
  Warnings:

  - A unique constraint covering the columns `[sourceTenderAwardId]` on the table `ScrapRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ScrapRecord" ADD COLUMN     "sourceTenderAwardId" TEXT;

-- AlterTable
ALTER TABLE "TenderAward" ADD COLUMN     "transferConfirmedBy" TEXT,
ADD COLUMN     "transferDate" TIMESTAMP(3),
ADD COLUMN     "transferNotes" TEXT,
ADD COLUMN     "transferQtyKg" DECIMAL(65,30),
ADD COLUMN     "transferStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ScrapRecord_sourceTenderAwardId_key" ON "ScrapRecord"("sourceTenderAwardId");

-- CreateIndex
CREATE INDEX "ScrapRecord_sourceTenderAwardId_idx" ON "ScrapRecord"("sourceTenderAwardId");

-- AddForeignKey
ALTER TABLE "ScrapRecord" ADD CONSTRAINT "ScrapRecord_sourceTenderAwardId_fkey" FOREIGN KEY ("sourceTenderAwardId") REFERENCES "TenderAward"("id") ON DELETE SET NULL ON UPDATE CASCADE;
