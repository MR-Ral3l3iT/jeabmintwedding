-- Rename the venue to the official department name.
-- Only rows still holding the previous default are touched so a manual edit
-- made through /admin is never clobbered.
UPDATE "wedding_settings"
SET "venue" = 'กรมยุทธบริการทหาร กองบัญชาการกองทัพไทย',
    "city" = 'อาคารอเนกประสงค์ กรุงเทพฯ',
    "updatedAt" = NOW()
WHERE "venue" = 'ณ อาคารอเนกประสงค์'
  AND "city" = 'กรมยุทธบริการทหาร, กรุงเทพฯ';
