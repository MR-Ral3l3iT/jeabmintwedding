-- CreateTable
CREATE TABLE "guest_categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_categories_pkey" PRIMARY KEY ("id")
);

-- Seed default categories (IDs match previous GuestCategory enum values)
INSERT INTO "guest_categories" ("id", "name", "sort_order", "created_at") VALUES
  ('GROOM_FRIEND', 'เพื่อนเจ้าบ่าว', 1, CURRENT_TIMESTAMP),
  ('BRIDE_FRIEND', 'เพื่อนเจ้าสาว', 2, CURRENT_TIMESTAMP),
  ('GROOM_ELDER', 'แขกผู้ใหญ่ฝั่งเจ้าบ่าว', 3, CURRENT_TIMESTAMP),
  ('BRIDE_ELDER', 'แขกผู้ใหญ่ฝั่งเจ้าสาว', 4, CURRENT_TIMESTAMP),
  ('OTHER', 'แขกกลุ่มอื่นๆ', 5, CURRENT_TIMESTAMP);

-- AlterTable: move enum category -> category_id text FK
ALTER TABLE "guests" ADD COLUMN "category_id" TEXT;

UPDATE "guests"
SET "category_id" = "category"::text
WHERE "category" IS NOT NULL;

ALTER TABLE "guests" DROP COLUMN "category";

DROP TYPE IF EXISTS "GuestCategory";

-- CreateIndex
CREATE INDEX "guest_categories_sort_order_idx" ON "guest_categories"("sort_order");
CREATE INDEX "guests_category_id_idx" ON "guests"("category_id");

-- AddForeignKey
ALTER TABLE "guests"
ADD CONSTRAINT "guests_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "guest_categories"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
