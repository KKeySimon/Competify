-- CreateTable
CREATE TABLE "competition_to_channel" (
    "discord_channel_id" INTEGER NOT NULL,
    "competition_id" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "competition_to_channel_discord_channel_id_key" ON "competition_to_channel"("discord_channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "competition_to_channel_discord_channel_id_competition_id_key" ON "competition_to_channel"("discord_channel_id", "competition_id");

-- AddForeignKey
ALTER TABLE "competition_to_channel" ADD CONSTRAINT "competition_to_channel_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
