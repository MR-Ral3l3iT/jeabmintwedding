-- Seating floor plan tables + facilities
CREATE TYPE "SeatingSpotKind" AS ENUM ('TABLE', 'FACILITY');

CREATE TABLE "seating_groups" (
    "id" TEXT NOT NULL,
    "guest_category_id" TEXT,
    "custom_name" VARCHAR(100),
    "color" VARCHAR(20) NOT NULL DEFAULT '#6b7c5e',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seating_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seating_tables" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "kind" "SeatingSpotKind" NOT NULL DEFAULT 'TABLE',
    "label" VARCHAR(100),
    "x_percent" DOUBLE PRECISION NOT NULL,
    "y_percent" DOUBLE PRECISION NOT NULL,
    "width_percent" DOUBLE PRECISION NOT NULL,
    "height_percent" DOUBLE PRECISION NOT NULL,
    "group_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "seating_tables_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seating_table_guests" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seating_table_guests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "seating_groups_guest_category_id_key" ON "seating_groups"("guest_category_id");
CREATE INDEX "seating_groups_sort_order_idx" ON "seating_groups"("sort_order");
CREATE UNIQUE INDEX "seating_tables_code_key" ON "seating_tables"("code");
CREATE INDEX "seating_tables_kind_idx" ON "seating_tables"("kind");
CREATE INDEX "seating_tables_group_id_idx" ON "seating_tables"("group_id");
CREATE UNIQUE INDEX "seating_table_guests_guest_id_key" ON "seating_table_guests"("guest_id");
CREATE INDEX "seating_table_guests_table_id_idx" ON "seating_table_guests"("table_id");

ALTER TABLE "seating_groups" ADD CONSTRAINT "seating_groups_guest_category_id_fkey" FOREIGN KEY ("guest_category_id") REFERENCES "guest_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seating_tables" ADD CONSTRAINT "seating_tables_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "seating_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "seating_table_guests" ADD CONSTRAINT "seating_table_guests_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "seating_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seating_table_guests" ADD CONSTRAINT "seating_table_guests_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed layout from docs/ผังงาน.pptx
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-A1','A1','TABLE',NULL,20.723,25.048,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-A2','A2','TABLE',NULL,21.005,29.983,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-A3','A3','TABLE',NULL,21.005,34.53,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-A4','A4','TABLE',NULL,20.703,39.592,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-A5','A5','TABLE',NULL,20.984,44.527,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-A6','A6','TABLE',NULL,20.984,49.074,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-A7','A7','TABLE',NULL,21.091,54.187,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-A8','A8','TABLE',NULL,21.091,58.734,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-A9','A9','TABLE',NULL,20.898,64.004,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-A10','A10','TABLE',NULL,20.898,68.551,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-A11','A11','TABLE',NULL,21.005,73.664,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-A12','A12','TABLE',NULL,21.005,78.211,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-B1','B1','TABLE',NULL,29.824,25.048,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-B2','B2','TABLE',NULL,30.105,29.983,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-B3','B3','TABLE',NULL,30.105,34.53,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-B4','B4','TABLE',NULL,29.803,39.592,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-B5','B5','TABLE',NULL,30.085,44.527,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-B6','B6','TABLE',NULL,30.085,49.074,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-B7','B7','TABLE',NULL,30.192,54.187,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-B8','B8','TABLE',NULL,30.192,58.734,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-B9','B9','TABLE',NULL,29.999,64.004,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-B10','B10','TABLE',NULL,29.999,68.551,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-B11','B11','TABLE',NULL,30.105,73.664,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-B12','B12','TABLE',NULL,30.105,78.211,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-C1','C1','TABLE',NULL,38.736,25.048,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-C2','C2','TABLE',NULL,39.017,29.983,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-C3','C3','TABLE',NULL,39.017,34.53,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-C4','C4','TABLE',NULL,38.716,39.592,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-C5','C5','TABLE',NULL,38.997,44.527,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-C6','C6','TABLE',NULL,38.997,49.074,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-C7','C7','TABLE',NULL,39.104,54.187,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-C8','C8','TABLE',NULL,39.104,58.734,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-C9','C9','TABLE',NULL,38.911,64.004,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-C10','C10','TABLE',NULL,38.911,68.551,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-C11','C11','TABLE',NULL,39.018,73.664,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-C12','C12','TABLE',NULL,39.018,78.211,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-D1','D1','TABLE',NULL,55.717,25.048,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-D2','D2','TABLE',NULL,55.703,29.848,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-D3','D3','TABLE',NULL,55.467,34.418,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-D4','D4','TABLE',NULL,55.697,39.592,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-D5','D5','TABLE',NULL,55.683,44.392,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-D6','D6','TABLE',NULL,55.447,48.962,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-D7','D7','TABLE',NULL,55.79,54.052,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-D8','D8','TABLE',NULL,55.554,58.622,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-D9','D9','TABLE',NULL,55.597,63.869,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-D10','D10','TABLE',NULL,55.361,68.439,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-D11','D11','TABLE',NULL,55.703,73.529,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-D12','D12','TABLE',NULL,55.468,78.099,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-E1','E1','TABLE',NULL,64.818,25.048,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-E2','E2','TABLE',NULL,64.804,29.848,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-E3','E3','TABLE',NULL,64.568,34.418,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-E4','E4','TABLE',NULL,64.797,39.592,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-E5','E5','TABLE',NULL,64.783,44.392,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-E6','E6','TABLE',NULL,64.547,48.962,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-E7','E7','TABLE',NULL,64.89,54.052,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-E8','E8','TABLE',NULL,64.654,58.622,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-E9','E9','TABLE',NULL,64.697,63.869,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-E10','E10','TABLE',NULL,64.461,68.439,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-E11','E11','TABLE',NULL,64.804,73.529,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-E12','E12','TABLE',NULL,64.568,78.099,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-F1','F1','TABLE',NULL,73.73,25.048,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-F2','F2','TABLE',NULL,73.716,29.848,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-F3','F3','TABLE',NULL,73.48,34.418,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-F4','F4','TABLE',NULL,73.71,39.592,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-F5','F5','TABLE',NULL,73.696,44.392,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-F6','F6','TABLE',NULL,73.46,48.962,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-F7','F7','TABLE',NULL,73.802,54.052,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-F8','F8','TABLE',NULL,73.566,58.622,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-F10','F10','TABLE',NULL,73.373,68.439,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-F11','F11','TABLE',NULL,73.716,73.529,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-F12','F12','TABLE',NULL,73.48,78.099,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('table-F19','F19','TABLE',NULL,73.609,63.869,6.78,4.028,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('FAC-1','FAC-1','FACILITY','เวที',18.313,9.137,65.681,7.504,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('FAC-2','FAC-2','FACILITY','ลิฟท์',2.602,35.402,6.904,2.698,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('FAC-3','FAC-3','FACILITY','AV Control',72.484,18.414,13.441,4.392,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('FAC-4','FAC-4','FACILITY','ห้องน้ำ ญ',73.47,4.145,10.298,5.823,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('FAC-5','FAC-5','FACILITY','ห้องน้ำ ช',63.78,4.14,9.733,5.823,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('FAC-6','FAC-6','FACILITY','ลงทะเบียน',29.759,95.577,11.609,2.444,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('FAC-7','FAC-7','FACILITY','แบลคดอฟ',7.646,95.577,13.569,3.259,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('FAC-8','FAC-8','FACILITY','บาร์เครื่องดื่ม',83.305,42.475,14.725,2.469,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('FAC-9','FAC-9','FACILITY','โฟโต้บูธ',1.97,89.222,9.1,2.145,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('FAC-10','FAC-10','FACILITY','ห้องน้ำ ญ',88.416,1.164,7.363,10.303,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('FAC-11','FAC-11','FACILITY','ห้องน้ำ ช',88.146,5.706,7.662,10.303,CURRENT_TIMESTAMP);
INSERT INTO "seating_tables" ("id","code","kind","label","x_percent","y_percent","width_percent","height_percent","updated_at") VALUES ('FAC-12','FAC-12','FACILITY','บาร์เครื่องดื่ม',76.096,91.167,11.052,2.697,CURRENT_TIMESTAMP);
