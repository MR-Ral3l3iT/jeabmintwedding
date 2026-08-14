-- CreateTable
CREATE TABLE "bot_conversations" (
    "id" TEXT NOT NULL,
    "line_user_id" VARCHAR(100) NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hinted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bot_conversations_line_user_id_key" ON "bot_conversations"("line_user_id");

-- CreateIndex
CREATE INDEX "bot_conversations_last_message_at_idx" ON "bot_conversations"("last_message_at");

-- AlterTable — เติมค่าให้แถวเดิมด้วย DEFAULT แล้วถอด default ออก (ค่าจริงตั้งจาก Bot Studio)
ALTER TABLE "bot_personas"
    ADD COLUMN "self_call_name" VARCHAR(50) NOT NULL DEFAULT 'มายมิ้นท์',
    ADD COLUMN "emoji_policy" TEXT NOT NULL DEFAULT 'ใส่ emoji 1-2 ตัวต่อข้อความ ให้เข้ากับอารมณ์ของคำถาม ไม่ใส่รัวๆ ไม่ใส่ทุกบรรทัด';

ALTER TABLE "bot_personas"
    ALTER COLUMN "self_call_name" DROP DEFAULT,
    ALTER COLUMN "emoji_policy" DROP DEFAULT;

-- ล็อคชื่อบอทเป็น "น้องมายมิ้นท์" ถ้ายังเป็นค่า default เดิมจาก migration ก่อนหน้า
UPDATE "bot_personas"
SET "display_name" = 'น้องมายมิ้นท์',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = 'default'
  AND "display_name" = 'ผู้ช่วยงานแต่ง Jeab & Mint';
