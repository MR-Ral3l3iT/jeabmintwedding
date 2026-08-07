-- CreateTable
CREATE TABLE "bot_personas" (
    "id" TEXT NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "tone" TEXT NOT NULL,
    "language_note" TEXT NOT NULL,
    "max_length" INTEGER NOT NULL DEFAULT 500,
    "do_not_do" TEXT NOT NULL,
    "when_unknown" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_knowledge_topics" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_knowledge_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_usage_logs" (
    "id" TEXT NOT NULL,
    "provider" VARCHAR(30) NOT NULL,
    "kind" VARCHAR(50) NOT NULL,
    "prompt_tokens" INTEGER,
    "completion_tokens" INTEGER,
    "total_tokens" INTEGER,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bot_knowledge_topics_sort_order_idx" ON "bot_knowledge_topics"("sort_order");

-- CreateIndex
CREATE INDEX "bot_usage_logs_provider_created_at_idx" ON "bot_usage_logs"("provider", "created_at");

-- Seed default persona
INSERT INTO "bot_personas" ("id", "display_name", "tone", "language_note", "max_length", "do_not_do", "when_unknown", "updated_at")
VALUES (
  'default',
  'ผู้ช่วยงานแต่ง Jeab & Mint',
  'สุภาพ อบอุ่น เป็นกันเอง ใช้ภาษาที่อ่านง่าย',
  'ตอบเป็นภาษาไทยเป็นหลัก ถ้าแขกถามเป็นภาษาอังกฤษให้ตอบอังกฤษได้',
  500,
  'ห้ามแต่งข้อมูลที่ไม่มีในบริบท ห้ามสัญญาเรื่องที่ยังไม่ยืนยัน ห้ามเปิดเผยข้อมูลส่วนตัวของแขกคนอื่น',
  'ถ้าไม่รู้คำตอบ ให้แนะนำติดต่อเบอร์หรือ LINE OA ของงานตามข้อมูลพื้นฐาน',
  CURRENT_TIMESTAMP
);
