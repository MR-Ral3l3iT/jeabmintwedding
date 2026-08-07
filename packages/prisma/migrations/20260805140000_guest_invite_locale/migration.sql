-- CreateEnum
CREATE TYPE "InviteLocale" AS ENUM ('TH', 'EN');

-- AlterTable
ALTER TABLE "guests" ADD COLUMN "locale" "InviteLocale" NOT NULL DEFAULT 'TH';
