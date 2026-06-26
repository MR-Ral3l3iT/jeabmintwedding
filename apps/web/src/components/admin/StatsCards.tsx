'use client';

import { CheckCircle2, Clock, Mail, UserX, Users } from 'lucide-react';
import { AdminFloralDecor } from '@/components/admin/AdminFloralDecor';
import { AdminHeartWreath } from '@/components/admin/AdminHeartWreath';
import type { Stats } from '@/types';

interface StatsCardsProps {
  stats: Stats;
}

const STAT_ITEMS = [
  {
    key: 'attending' as const,
    label: 'เข้าร่วม',
    icon: CheckCircle2,
    valueColor: 'text-[#3d6b45]',
    bg: 'bg-[#eef5eb]',
    border: 'border-[#d8ead8]',
    iconWrap: 'bg-[#dcebdd] text-[#4a7a52]',
  },
  {
    key: 'declined' as const,
    label: 'ไม่สะดวก',
    icon: UserX,
    valueColor: 'text-[#9a4f4f]',
    bg: 'bg-[#fdf0f0]',
    border: 'border-[#f5dede]',
    iconWrap: 'bg-[#f5dede] text-[#b05a5a]',
  },
  {
    key: 'pendingInvites' as const,
    label: 'รอตอบรับ',
    icon: Clock,
    valueColor: 'text-[#9a7340]',
    bg: 'bg-[#fdf8ed]',
    border: 'border-[#f3e8cc]',
    iconWrap: 'bg-[#f3e8cc] text-[#b08840]',
  },
  {
    key: 'totalWishes' as const,
    label: 'การ์ดอวยพร',
    icon: Mail,
    valueColor: 'text-[#3d5c5c]',
    bg: 'bg-[#f0f4f2]',
    border: 'border-[#dde5e0]',
    iconWrap: 'bg-[#dde5e0] text-[#4d6b6b]',
  },
] as const;

export function StatsCards({ stats }: StatsCardsProps) {
  const pending = stats.pendingInvites ?? 0;
  const responded = stats.totalGuests;
  const total = responded + pending;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
  const totalAttendees = stats.totalAttendees ?? 0;

  const attendingPct = total > 0 ? (stats.attending / total) * 100 : 0;
  const declinedPct = total > 0 ? (stats.declined / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;

  return (
    <section className="mt-6">
      <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-5 shadow-[0_4px_28px_rgba(30,58,58,0.06)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <AdminHeartWreath />

          <div className="min-w-0 flex-1">
            <p className="text-[0.9rem] font-medium text-[#1a3228]">ภาพรวมการตอบรับ</p>
            <p className="mt-1 font-serif-cg text-[2.1rem] font-semibold leading-none text-[#1a3228]">
              {responded}
              <span className="ml-1.5 text-[1.35rem] font-normal text-[#8a8a8a]">/ {total}</span>
            </p>
            <p className="mt-1 text-sm text-[#8a8a8a]">ตอบรับแล้ว {responseRate}%</p>

            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-[#eceee9]">
              {attendingPct > 0 && (
                <div className="h-full bg-[#5ea86a]" style={{ width: `${attendingPct}%` }} />
              )}
              {declinedPct > 0 && (
                <div className="h-full bg-[#e07b7b]" style={{ width: `${declinedPct}%` }} />
              )}
              {pendingPct > 0 && (
                <div className="h-full bg-[#e8c468]" style={{ width: `${pendingPct}%` }} />
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.72rem] text-[#8a8a8a]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#5ea86a]" />
                เข้าร่วม {stats.attending}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#e07b7b]" />
                ไม่สะดวก {stats.declined}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#e8c468]" />
                รอตอบรับ {pending}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#c5cfc5]" />
                การ์ดอวยพร {stats.totalWishes}
              </span>
            </div>
          </div>

          <div className="shrink-0 rounded-xl border border-[#d8ead8] bg-[#eef5eb] px-5 py-4 text-center sm:min-w-[9rem]">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#dcebdd] text-[#4a7a52]">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="font-serif-cg text-[2.25rem] font-semibold leading-none text-[#3d6b45]">
              {totalAttendees}
            </p>
            <p className="mt-1.5 text-[0.72rem] font-medium text-[#1a3228]">คนมาร่วมงานทั้งหมด</p>
            <p className="mt-0.5 text-[0.65rem] text-[#8a8a8a]">จาก {stats.attending} รายการเชิญ</p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STAT_ITEMS.map(({ key, label, icon: Icon, valueColor, bg, border, iconWrap }) => {
          const value = key === 'pendingInvites' ? pending : stats[key];

          return (
            <div
              key={key}
              className={`relative overflow-hidden rounded-[1rem] border px-4 py-5 text-center ${bg} ${border}`}
            >
              <AdminFloralDecor variant="card" />
              <div className="relative z-[1] flex flex-col items-center">
                <div
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${iconWrap}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className={`font-serif-cg text-[2rem] font-semibold leading-none ${valueColor}`}>
                  {value}
                </div>
                <div className="mt-1.5 text-[0.72rem] text-[#8a8a8a]">{label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
