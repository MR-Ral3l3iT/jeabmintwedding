-- CreateTable
CREATE TABLE "line_friends" (
    "id" TEXT NOT NULL,
    "line_user_id" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(150),
    "picture_url" VARCHAR(500),
    "followed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unfollowed_at" TIMESTAMP(3),
    "guest_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "line_friends_pkey" PRIMARY KEY ("id")
);

-- AlterTable: unique on guests.lineUserId (if duplicate nulls are ok in PG)
CREATE UNIQUE INDEX IF NOT EXISTS "guests_lineUserId_key" ON "guests"("lineUserId");

-- AlterTable WeddingSettings bios
ALTER TABLE "wedding_settings" ADD COLUMN IF NOT EXISTS "groom_bio" TEXT;
ALTER TABLE "wedding_settings" ADD COLUMN IF NOT EXISTS "bride_bio" TEXT;
ALTER TABLE "wedding_settings" ADD COLUMN IF NOT EXISTS "bot_knowledge" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "line_friends_line_user_id_key" ON "line_friends"("line_user_id");
CREATE UNIQUE INDEX "line_friends_guest_id_key" ON "line_friends"("guest_id");
CREATE INDEX "line_friends_followed_at_idx" ON "line_friends"("followed_at");
CREATE INDEX "line_friends_unfollowed_at_idx" ON "line_friends"("unfollowed_at");

-- AddForeignKey
ALTER TABLE "line_friends"
ADD CONSTRAINT "line_friends_guest_id_fkey"
FOREIGN KEY ("guest_id") REFERENCES "guests"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
