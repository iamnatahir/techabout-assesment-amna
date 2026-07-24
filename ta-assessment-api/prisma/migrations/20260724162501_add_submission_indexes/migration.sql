/*
  Warnings:

  - The `status` column on the `Submission` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('Pending', 'Reviewed', 'Accepted', 'Rejected');

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "status",
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'Pending';

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");
