import ExcelJS from 'exceljs';
import type { SeatingPlan, SeatingSpot } from '@/types';

function compareTableCodes(a: string, b: string): number {
  const ma = /^([A-Za-z]+)(\d+)$/.exec(a);
  const mb = /^([A-Za-z]+)(\d+)$/.exec(b);
  if (ma && mb) {
    const letter = ma[1].localeCompare(mb[1], 'en');
    if (letter !== 0) return letter;
    return Number(ma[2]) - Number(mb[2]);
  }
  return a.localeCompare(b, 'en', { numeric: true });
}

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true };
  row.alignment = { vertical: 'middle' };
}

function autoWidth(sheet: ExcelJS.Worksheet, min = 10, max = 48) {
  sheet.columns.forEach((col) => {
    let longest = min;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.value ?? '').length;
      if (len > longest) longest = len;
    });
    col.width = Math.min(max, longest + 2);
  });
}

function guestNames(spot: SeatingSpot): string {
  return spot.guests.map((g) => g.displayName).join(', ');
}

export async function exportSeatingExcel(plan: SeatingPlan): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Jeab & Mint Wedding';
  workbook.created = new Date();

  const tables = plan.spots
    .filter((s) => s.kind === 'TABLE')
    .slice()
    .sort((a, b) => compareTableCodes(a.code, b.code));

  // 1. ตามโต๊ะ
  const byTable = workbook.addWorksheet('ตามโต๊ะ');
  byTable.addRow(['โต๊ะ', 'ชื่อย่อกลุ่ม', 'ชื่อกลุ่ม', 'รายชื่อแขกที่ระบุ', 'จำนวนคนที่ระบุ']);
  styleHeader(byTable.getRow(1));
  for (const t of tables) {
    byTable.addRow([
      t.code,
      t.groupShortName ?? '',
      t.groupName ?? '',
      guestNames(t),
      t.guests.length || '',
    ]);
  }
  autoWidth(byTable);

  // 2. ตามกลุ่ม
  const byGroup = workbook.addWorksheet('ตามกลุ่ม');
  byGroup.addRow(['ชื่อย่อ', 'ชื่อกลุ่ม', 'จำนวนโต๊ะ', 'รายการโต๊ะ']);
  styleHeader(byGroup.getRow(1));
  const groups = plan.groups.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  for (const g of groups) {
    const codes = (g.tableCodes ?? []).slice().sort(compareTableCodes);
    byGroup.addRow([
      g.shortName,
      g.name,
      codes.length,
      codes.join(', '),
    ]);
  }
  autoWidth(byGroup);

  // 3. แขกที่ระบุโต๊ะ
  const assigned = workbook.addWorksheet('แขกที่ระบุโต๊ะ');
  assigned.addRow(['ชื่อ', 'โต๊ะ', 'กลุ่ม', 'ประเภทการ์ด']);
  styleHeader(assigned.getRow(1));
  const assignedRows: Array<[string, string, string, string]> = [];
  for (const t of tables) {
    for (const g of t.guests) {
      assignedRows.push([
        g.displayName,
        t.code,
        t.groupName ?? t.groupShortName ?? '',
        g.categoryName ?? '',
      ]);
    }
  }
  assignedRows.sort((a, b) => {
    const byTableCode = compareTableCodes(a[1], b[1]);
    if (byTableCode !== 0) return byTableCode;
    return a[0].localeCompare(b[0], 'th');
  });
  for (const row of assignedRows) {
    assigned.addRow(row);
  }
  autoWidth(assigned);

  // 4. ยังไม่มีโต๊ะ
  const unassigned = workbook.addWorksheet('ยังไม่มีโต๊ะ');
  unassigned.addRow(['ชื่อ', 'ประเภทการ์ด']);
  styleHeader(unassigned.getRow(1));
  const unassignedGuests = plan.unassignedGuests
    .slice()
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'th'));
  for (const g of unassignedGuests) {
    unassigned.addRow([g.displayName, g.categoryName ?? '']);
  }
  autoWidth(unassigned);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const filename = `seating-${yyyy}-${mm}-${dd}.xlsx`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
