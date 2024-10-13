-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "content_number" DOUBLE PRECISION,
ALTER COLUMN "content" DROP NOT NULL;
