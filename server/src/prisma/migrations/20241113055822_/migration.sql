/*
  Warnings:

  - Added the required column `is_numerical` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "is_numerical" BOOLEAN NOT NULL;
