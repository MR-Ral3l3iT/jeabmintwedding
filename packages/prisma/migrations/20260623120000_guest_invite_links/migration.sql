-- AlterTable: รองรับชื่อบนการ์ด + ลิงก์เชิญรายบุคคล
ALTER TABLE "guests" ADD COLUMN "displayName" VARCHAR(150),
ADD COLUMN "inviteToken" VARCHAR(32),
ADD COLUMN "rsvpAt" TIMESTAMP(3);

ALTER TABLE "guests" ALTER COLUMN "name" DROP NOT NULL;
ALTER TABLE "guests" ALTER COLUMN "attending" DROP NOT NULL;

CREATE UNIQUE INDEX "guests_inviteToken_key" ON "guests"("inviteToken");
CREATE INDEX "guests_displayName_idx" ON "guests"("displayName");

-- backfill ข้อมูลเดิมที่ตอบ RSVP แล้ว
UPDATE "guests" SET "displayName" = "name" WHERE "displayName" IS NULL AND "name" IS NOT NULL;
UPDATE "guests" SET "rsvpAt" = "createdAt" WHERE "rsvpAt" IS NULL AND "name" IS NOT NULL;
