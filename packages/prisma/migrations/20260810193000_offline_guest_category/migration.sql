-- Add offline walk-in category for /join QR registrations
INSERT INTO "guest_categories" ("id", "name", "sort_order", "created_at")
VALUES ('OFFLINE', 'ออฟไลน์', 0, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Existing guests without a category are almost always from offline /join
UPDATE "guests"
SET "category_id" = 'OFFLINE'
WHERE "category_id" IS NULL;
