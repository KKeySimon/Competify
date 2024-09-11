/*
  Warnings:

  - You are about to drop the column `days_of_week` on the `competitions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[event_id,user_id]` on the table `submissions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "competitions" DROP COLUMN "days_of_week";

-- CreateIndex
CREATE UNIQUE INDEX "submissions_event_id_user_id_key" ON "submissions"("event_id", "user_id");
