/*
  Warnings:

  - Added the required column `policy` to the `competitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `competitions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGHEST', 'LOWEST');

-- CreateEnum
CREATE TYPE "Policy" AS ENUM ('FLAT', 'FLAT_CHANGE', 'PERCENTAGE_CHANGE');

-- DropForeignKey
ALTER TABLE "competitions" DROP CONSTRAINT "competitions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_winner_id_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_event_id_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_user_id_fkey";

-- AlterTable
ALTER TABLE "competitions" ADD COLUMN     "policy" "Policy" NOT NULL,
ADD COLUMN     "priority" "Priority" NOT NULL;

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
