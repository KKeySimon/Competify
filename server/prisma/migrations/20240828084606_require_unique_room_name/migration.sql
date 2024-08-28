/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `rooms` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "usersInRooms" DROP CONSTRAINT "usersInRooms_roomId_fkey";

-- DropForeignKey
ALTER TABLE "usersInRooms" DROP CONSTRAINT "usersInRooms_userId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "rooms_name_userId_key" ON "rooms"("name", "userId");

-- AddForeignKey
ALTER TABLE "usersInRooms" ADD CONSTRAINT "usersInRooms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usersInRooms" ADD CONSTRAINT "usersInRooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
