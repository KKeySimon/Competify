/*
  Warnings:

  - Added the required column `previous` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "previous" BOOLEAN NOT NULL;
