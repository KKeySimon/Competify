/*
  Warnings:

  - You are about to drop the column `event_id` on the `votes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_event_id_fkey";

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "event_id",
ADD COLUMN     "eventsId" INTEGER;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_eventsId_fkey" FOREIGN KEY ("eventsId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
