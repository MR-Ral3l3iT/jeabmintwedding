'use client';

import { CalendarDays } from 'lucide-react';
import { WEDDING } from '@/lib/constants';
import { useCountdown } from '@/hooks/useCountdown';
import { AdminFloralDecor } from '@/components/admin/AdminFloralDecor';

function formatWeddingDate(): string {
  return WEDDING.date.toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function DashboardWelcome() {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(WEDDING.date);

  return (
    <section className="relative min-h-[220px] overflow-hidden rounded-[1.25rem] border border-[#c5a059]/45 bg-[#1a3228] shadow-[0_10px_40px_rgba(26,50,40,0.22)] sm:min-h-[240px]">
      <AdminFloralDecor variant="banner-left" />
      <AdminFloralDecor variant="banner-right" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(197,160,89,0.12),transparent_55%)]"
        aria-hidden="true"
      />

      <div className="relative z-[1] flex flex-col items-center gap-6 px-8 py-8 sm:px-12 sm:py-9 lg:flex-row lg:justify-center lg:gap-12">
        <div className="flex min-w-0 flex-col items-center text-center">
          <p className="text-[0.62rem] font-semibold tracking-[0.22em] text-[#d4b87a]/90 uppercase">
            Welcome back
          </p>
          <h2 className="mt-2 font-display text-[2.4rem] leading-[0.95] text-[#d4b87a] sm:text-[2.85rem]">
            Jeab &amp; Mint
          </h2>
          <p className="mt-3 text-[0.95rem] text-white/75">
            ภาพรวมงานแต่งของ {WEDDING.brideNickname} &amp; {WEDDING.groomNickname}
          </p>

          <div className="my-4 flex w-full max-w-[11rem] items-center gap-2" aria-hidden="true">
            <div className="h-px flex-1 bg-[#c5a059]/35" />
            <span className="text-[0.55rem] text-[#d4b87a]/75">✦</span>
            <div className="h-px flex-1 bg-[#c5a059]/35" />
          </div>

          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#c5a059]/30 bg-[#12241c]/90 px-4 py-2.5 text-[0.85rem] text-white/90">
            <CalendarDays className="h-4 w-4 shrink-0 text-[#d4b87a]" aria-hidden="true" />
            <span>{formatWeddingDate()}</span>
          </div>
        </div>

        {!isExpired && (
          <div className="w-full max-w-[232px] shrink-0 rounded-[1rem] border border-[#c5a059]/40 bg-[#12241c]/80 px-7 py-5 text-center">
            <p className="text-[0.62rem] font-medium tracking-[0.16em] text-white/45 uppercase">
              ก่อนถึงวันสำคัญ
            </p>
            <p className="mt-2 font-serif-cg text-[2.75rem] font-semibold leading-none text-[#d4b87a] tabular-nums">
              {days}
              <span className="ml-1.5 text-lg font-normal text-white/55">วัน</span>
            </p>
            <div className="my-4 h-px bg-[#c5a059]/25" aria-hidden="true" />
            <div className="grid grid-cols-3 gap-1 text-center">
              {[
                { value: pad(hours), label: 'ชั่วโมง' },
                { value: pad(minutes), label: 'นาที' },
                { value: pad(seconds), label: 'วินาที' },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={i > 0 ? 'border-l border-[#c5a059]/20' : undefined}
                >
                  <p className="text-sm font-medium tabular-nums text-[#d4b87a]">{item.value}</p>
                  <p className="mt-0.5 text-[0.62rem] text-white/40">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
