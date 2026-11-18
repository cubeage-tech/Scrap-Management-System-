-- CreateTable
CREATE TABLE "TenderSubmissionDocument" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "uploadedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenderSubmissionDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenderSubmissionDocument_submissionId_idx" ON "TenderSubmissionDocument"("submissionId");

-- AddForeignKey
ALTER TABLE "TenderSubmissionDocument" ADD CONSTRAINT "TenderSubmissionDocument_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "TenderSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderSubmissionDocument" ADD CONSTRAINT "TenderSubmissionDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
