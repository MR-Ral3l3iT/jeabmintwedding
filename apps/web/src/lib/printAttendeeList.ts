import { WEDDING } from '@/lib/constants';
import {
  GUEST_CATEGORY_PRINT_ORDER,
  guestCategoryLabel,
  type GuestCategory,
} from '@/lib/guestCategory';
import type { Guest } from '@/types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function guestLabel(g: Guest): string {
  return g.displayName ?? g.name ?? 'ไม่ระบุชื่อ';
}

function buildPrintHtml(guests: Guest[]): string {
  const grouped = new Map<GuestCategory | 'UNSET', Guest[]>();

  for (const key of GUEST_CATEGORY_PRINT_ORDER) {
    grouped.set(key ?? 'UNSET', []);
  }

  for (const guest of guests) {
    const key = guest.category ?? 'UNSET';
    const list = grouped.get(key) ?? [];
    list.push(guest);
    grouped.set(key, list);
  }

  for (const list of grouped.values()) {
    list.sort((a, b) => guestLabel(a).localeCompare(guestLabel(b), 'th'));
  }

  const totalPeople = guests.reduce((sum, g) => sum + (g.attendeeCount ?? 0), 0);
  const printedAt = new Date().toLocaleString('th-TH', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  const weddingDate = WEDDING.date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let rowIndex = 0;
  const sections = GUEST_CATEGORY_PRINT_ORDER.map((key) => {
    const mapKey = key ?? 'UNSET';
    const list = grouped.get(mapKey) ?? [];
    if (list.length === 0) return '';

    const sectionLabel = guestCategoryLabel(key);
    const sectionPeople = list.reduce((sum, g) => sum + (g.attendeeCount ?? 0), 0);
    const rows = list
      .map((g) => {
        rowIndex += 1;
        const cardName = escapeHtml(guestLabel(g));
        const count = g.attendeeCount != null ? `${g.attendeeCount} คน` : '—';
        const category = escapeHtml(guestCategoryLabel(g.category));

        return `<tr>
          <td>${rowIndex}</td>
          <td>${cardName}</td>
          <td>${category}</td>
          <td class="center">${count}</td>
          <td class="notes"></td>
        </tr>`;
      })
      .join('');

    return `
      <tr class="section">
        <td colspan="5">${escapeHtml(sectionLabel)} · ${list.length} รายการ · ${sectionPeople} คน</td>
      </tr>
      ${rows}`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <title>รายชื่อผู้เข้าร่วมงาน</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Sarabun', 'Thonburi', sans-serif;
      color: #1a3228;
      margin: 0;
      padding: 24px 28px;
      font-size: 14px;
      line-height: 1.5;
    }
    h1 {
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 4px;
    }
    .meta {
      color: #666;
      font-size: 13px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #d5ddd0;
      padding: 10px 12px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f7f9f5;
      font-weight: 600;
    }
    tr.section td {
      background: #eef2ea;
      font-weight: 600;
      color: #1a3228;
    }
    td.center, th.center { text-align: center; }
    td.notes {
      min-width: 120px;
      min-height: 28px;
    }
    .summary {
      margin: 0 0 16px;
      padding: 12px 14px;
      border: 1px solid #d8ead8;
      border-radius: 8px;
      background: #f7f9f5;
      font-size: 15px;
      font-weight: 600;
    }
    @media print {
      body { padding: 12px 16px; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <h1>รายชื่อผู้เข้าร่วมงาน</h1>
  <p class="meta">
    ${escapeHtml(WEDDING.brideNickname)} &amp; ${escapeHtml(WEDDING.groomNickname)} · งานวันที่ ${escapeHtml(weddingDate)}<br />
    พิมพ์เมื่อ ${escapeHtml(printedAt)}
  </p>
  <p class="summary">จำนวนผู้เข้าร่วมงานทั้งหมด ${totalPeople} คน</p>
  <table>
    <thead>
      <tr>
        <th style="width:48px">ลำดับ</th>
        <th>ชื่อบนการ์ด</th>
        <th style="width:160px">ประเภทแขก</th>
        <th class="center" style="width:88px">จำนวนคน</th>
        <th>หมายเหตุ</th>
      </tr>
    </thead>
    <tbody>
      ${sections}
    </tbody>
  </table>
  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`;
}

/** เปิดหน้าต่างทันทีตอนกดปุ่ม (ก่อน await) เพื่อไม่ให้เบราว์เซอร์บล็อก popup */
export function openPrintWindow(): Window | null {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return null;

  printWindow.document.write(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <title>กำลังโหลด...</title>
  <style>
    body {
      font-family: 'Sarabun', 'Thonburi', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      color: #1a3228;
      font-size: 16px;
    }
  </style>
</head>
<body>กำลังโหลดรายชื่อ...</body>
</html>`);
  printWindow.document.close();

  return printWindow;
}

export function renderPrintAttendeeList(printWindow: Window, guests: Guest[]): void {
  printWindow.document.open();
  printWindow.document.write(buildPrintHtml(guests));
  printWindow.document.close();
}

export function closePrintWindow(printWindow: Window): void {
  if (!printWindow.closed) {
    printWindow.close();
  }
}
