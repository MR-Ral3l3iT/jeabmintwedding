-- CreateEnum
CREATE TYPE "GuestCategory" AS ENUM ('GROOM_FRIEND', 'BRIDE_FRIEND', 'GROOM_ELDER', 'BRIDE_ELDER', 'OTHER');

-- AlterTable
ALTER TABLE "guests" ADD COLUMN "category" "GuestCategory";

-- CreateIndex
CREATE INDEX "guests_category_idx" ON "guests"("category");
