-- CreateTable
CREATE TABLE "competition_invites" (
    "id" SERIAL NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competition_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "competition_invites_token_key" ON "competition_invites"("token");

-- AddForeignKey
ALTER TABLE "competition_invites" ADD CONSTRAINT "competition_invites_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
