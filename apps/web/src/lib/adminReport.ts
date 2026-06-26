import type { Guest, Stats } from '@/types';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function guestStatusLabel(g: Guest): string {
  if (!g.rsvpAt) return 'รอตอบรับ';
  return g.attending ? 'เข้าร่วม' : 'ไม่สะดวก';
}

export function downloadGuestReport(guests: Guest[], stats: Stats): void {
  const summary = [
    'สรุปการตอบรับ',
    `เข้าร่วม,${stats.attending}`,
    `จำนวนคนมางานรวม,${stats.totalAttendees ?? stats.attending}`,
    `ไม่สะดวก,${stats.declined}`,
    `รอตอบรับ,${stats.pendingInvites ?? 0}`,
    `การ์ดอวยพร,${stats.totalWishes}`,
    '',
    'ชื่อบนการ์ด,ชื่อตอบรับ,สถานะ,จำนวนคน,วันที่ตอบรับ,คำอวยพร',
  ];

  const rows = guests.map((g) =>
    [
      escapeCsv(g.displayName ?? ''),
      escapeCsv(g.name ?? ''),
      guestStatusLabel(g),
      g.attending && g.attendeeCount ? String(g.attendeeCount) : '',
      g.rsvpAt ? new Date(g.rsvpAt).toLocaleString('th-TH') : '',
      escapeCsv(g.wishMessage ?? ''),
    ].join(','),
  );

  const csv = `\uFEFF${[...summary, ...rows].join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rsvp-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
