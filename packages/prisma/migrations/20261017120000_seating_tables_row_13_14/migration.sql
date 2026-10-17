-- Add full rows 13 and 14 (A–F) so the hall has 84 tables.
-- Existing tables and their group assignments are left untouched.
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at")
VALUES
  ('table-A13','A13','TABLE',NULL,21.005,82.758,6.78,4.028,CURRENT_TIMESTAMP),
  ('table-A14','A14','TABLE',NULL,21.005,87.305,6.78,4.028,CURRENT_TIMESTAMP),
  ('table-B13','B13','TABLE',NULL,30.105,82.758,6.78,4.028,CURRENT_TIMESTAMP),
  ('table-B14','B14','TABLE',NULL,30.105,87.305,6.78,4.028,CURRENT_TIMESTAMP),
  ('table-C13','C13','TABLE',NULL,39.018,82.758,6.78,4.028,CURRENT_TIMESTAMP),
  ('table-C14','C14','TABLE',NULL,39.018,87.305,6.78,4.028,CURRENT_TIMESTAMP),
  ('table-D13','D13','TABLE',NULL,55.468,82.669,6.78,4.028,CURRENT_TIMESTAMP),
  ('table-D14','D14','TABLE',NULL,55.468,87.239,6.78,4.028,CURRENT_TIMESTAMP),
  ('table-E13','E13','TABLE',NULL,64.568,82.669,6.78,4.028,CURRENT_TIMESTAMP),
  ('table-E14','E14','TABLE',NULL,64.568,87.239,6.78,4.028,CURRENT_TIMESTAMP),
  ('table-F13','F13','TABLE',NULL,73.48,82.669,6.78,4.028,CURRENT_TIMESTAMP),
  ('table-F14','F14','TABLE',NULL,73.48,87.239,6.78,4.028,CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
