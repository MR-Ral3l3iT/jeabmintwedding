'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminFloralDecor } from '@/components/admin/AdminFloralDecor';
import { DashboardWelcome } from '@/components/admin/DashboardWelcome';
import { StatsCards } from '@/components/admin/StatsCards';
import { QuickActions } from '@/components/admin/QuickActions';
import { RecentRsvpList } from '@/components/admin/RecentRsvpList';
import { WishCard } from '@/components/admin/WishCard';
import { getAdminStats, getAdminGuests, getAdminWishes } from '@/lib/api';
import type { Guest, Stats, Wish } from '@/types';

const DASHBOARD_RECENT_LIMIT = 5;

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/admin-token=([^;]+)/);
  return match ? match[1] : '';
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRsvps, setRecentRsvps] = useState<Guest[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    Promise.all([
      getAdminStats(token),
      getAdminGuests(token, {
        limit: DASHBOARD_RECENT_LIMIT,
        sort: 'rsvp',
        status: 'responded',
      }),
      getAdminWishes(token, { limit: DASHBOARD_RECENT_LIMIT }),
    ])
      .then(([s, guestsRes, w]) => {
        setStats(s);
        setRecentRsvps(guestsRes.data);
        setWishes(w);
      })
      .catch(() => setError('ไม่สามารถโหลดข้อมูลได้'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader activeTab="dashboard" />
      <main className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-8">
        <DashboardWelcome />

        {loading && (
          <div className="py-16 text-center text-text-light">กำลังโหลด...</div>
        )}
        {error && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && stats && (
          <>
            <StatsCards stats={stats} />
            <QuickActions />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <RecentRsvpList guests={recentRsvps} limit={DASHBOARD_RECENT_LIMIT} />

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[0.9rem] font-medium text-[#1a3228]">
                    การ์ดอวยพรล่าสุด
                    <span className="ml-1.5 text-[0.75rem] font-normal text-[#8a8a8a]">
                      ({DASHBOARD_RECENT_LIMIT} รายการ)
                    </span>
                  </h3>
                  <Link href="/admin/wishes" className="text-[0.75rem] text-[#6b7c5e] hover:underline">
                    ดูทั้งหมด →
                  </Link>
                </div>

                {wishes.length === 0 ? (
                  <div className="rounded-[1.25rem] border border-dashed border-[#d5ddd0] bg-white/80 px-4 py-10 text-center">
                    <AdminFloralDecor variant="empty" />
                    <p className="mt-3 font-serif-cg text-[0.9rem] italic text-[#8a8a8a]">
                      ยังไม่มีการ์ดอวยพรค่ะ
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {wishes.map((w) => (
                      <WishCard key={w.id} wish={w} compact />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </>
  );
}
