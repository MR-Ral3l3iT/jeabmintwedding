import Link from 'next/link';
import { CheckCircle2, UserX } from 'lucide-react';
import { AdminFloralDecor } from '@/components/admin/AdminFloralDecor';
import { formatThaiDate } from '@/lib/utils';
import type { Guest } from '@/types';

interface RecentRsvpListProps {
  guests: Guest[];
  limit?: number;
}

export function RecentRsvpList({ guests, limit = 5 }: RecentRsvpListProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[0.9rem] font-medium text-[#1a3228]">
          ตอบรับล่าสุด
          <span className="ml-1.5 text-[0.75rem] font-normal text-[#8a8a8a]">({limit} รายการ)</span>
        </h3>
        <Link href="/admin/guests" className="text-[0.75rem] text-[#6b7c5e] hover:underline">
          ดูทั้งหมด →
        </Link>
      </div>

      {guests.length === 0 ? (
        <div className="rounded-[1.25rem] border border-dashed border-[#d5ddd0] bg-white/80 px-4 py-10 text-center">
          <AdminFloralDecor variant="empty" />
          <p className="mt-3 font-serif-cg text-[0.9rem] italic text-[#8a8a8a]">
            ยังไม่มีการตอบรับเลยค่ะ
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#e5e9e0] overflow-hidden rounded-[1.25rem] border border-[#e5e9e0] bg-white shadow-[0_2px_12px_rgba(30,58,58,0.04)]">
          {guests.map((g) => {
            const name = g.name ?? g.displayName ?? 'ไม่ระบุชื่อ';
            const attending = g.attending === true;

            return (
              <li key={g.id} className="flex items-center gap-3 px-4 py-3.5">
                <div
                  className={[
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                    attending ? 'bg-[#eef5eb] text-[#4a7a52]' : 'bg-[#fdf0f0] text-[#b05a5a]',
                  ].join(' ')}
                >
                  {attending ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <UserX className="h-4 w-4" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.88rem] font-medium text-[#2c2c2c]">{name}</p>
                  <p className="text-[0.75rem] text-[#8a8a8a]">
                    {attending ? 'เข้าร่วม' : 'ไม่สะดวก'}
                    {attending && g.attendeeCount ? ` · ${g.attendeeCount} คน` : ''}
                    {g.rsvpAt && ` · ${formatThaiDate(g.rsvpAt)}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
