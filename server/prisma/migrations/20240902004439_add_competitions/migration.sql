-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateTable
CREATE TABLE "competitions" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "daysOfWeek" INTEGER,
    "repeatsEvery" INTEGER NOT NULL,
    "frequency" "Frequency" NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
