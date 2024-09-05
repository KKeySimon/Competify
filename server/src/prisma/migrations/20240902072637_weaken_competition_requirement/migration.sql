/*
  Warnings:

  - You are about to drop the column `userId` on the `competitions` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `competitions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "competitions" DROP CONSTRAINT "competitions_userId_fkey";

-- AlterTable
ALTER TABLE "competitions" DROP COLUMN "userId",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "frequency" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
