-- Add short badge label for seating groups
ALTER TABLE "seating_groups" ADD COLUMN "short_name" VARCHAR(20);

-- Backfill from custom name or linked guest category name (max 4 chars)
UPDATE "seating_groups" g
SET "short_name" = LEFT(
  COALESCE(
    NULLIF(TRIM(g."custom_name"), ''),
    (SELECT c."name" FROM "guest_categories" c WHERE c."id" = g."guest_category_id"),
    'กลุ่ม'
  ),
  4
)
WHERE g."short_name" IS NULL;

ALTER TABLE "seating_groups" ALTER COLUMN "short_name" SET NOT NULL;
