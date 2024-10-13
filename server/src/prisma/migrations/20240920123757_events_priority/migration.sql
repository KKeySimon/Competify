/*
  Warnings:

  - Added the required column `policy` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "policy" "Policy" NOT NULL,
ADD COLUMN     "priority" "Priority" NOT NULL;
