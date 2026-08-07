-- CreateEnum
CREATE TYPE "PartySide" AS ENUM ('GROOM', 'BRIDE');

-- AlterTable
ALTER TABLE "guests" ADD COLUMN "party_side" "PartySide";

-- CreateIndex
CREATE INDEX "guests_party_side_idx" ON "guests"("party_side");
