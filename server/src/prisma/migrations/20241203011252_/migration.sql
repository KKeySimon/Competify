-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('TEXT', 'URL', 'IMAGE_URL');

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "submission_type" "SubmissionType";
