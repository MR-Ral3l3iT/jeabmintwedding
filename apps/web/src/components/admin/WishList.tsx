'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { getAdminWishes } from '@/lib/api';
import { WishCard } from '@/components/admin/WishCard';
import { AdminFloralDecor } from '@/components/admin/AdminFloralDecor';
import type { Wish } from '@/types';

function getToken(): string {
  const match = document.cookie.match(/admin-token=([^;]+)/);
  return match ? match[1] : '';
}

const PAGE_SIZE = 10;

function WishPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-[1.25rem] border border-[#e5e9e0] bg-white px-4 py-3 shadow-[0_4px_24px_rgba(30,58,58,0.05)] sm:flex-row sm:px-5">
      <p className="text-[0.75rem] text-[#8a8a8a]">
        แสดง {start}–{end} จาก {total} รายการ
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e9e0] text-[#6b7c5e] transition-colors hover:border-[#c5cfc5] hover:bg-[#faf8f4] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="หน้าก่อนหน้า"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[5.5rem] text-center text-[0.8rem] text-[#2c2c2c]">
          หน้า {page} / {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e9e0] text-[#6b7c5e] transition-colors hover:border-[#c5cfc5] hover:bg-[#faf8f4] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="หน้าถัดไป"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function WishSummaryCard({ count }: { count: number }) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-[1rem] border border-[#dde5e0] bg-[#f0f4f2] px-4 py-3 sm:min-w-[10.5rem] sm:px-5 sm:py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dde5e0] text-[#4d6b6b]">
        <Mail className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="font-serif-cg text-[1.5rem] font-semibold leading-none text-[#3d5c5c]">
          {count}
        </p>
        <p className="mt-1 text-[0.72rem] text-[#8a8a8a]">การ์ดอวยพรทั้งหมด</p>
      </div>
    </div>
  );
}

export function WishList() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminWishes(getToken())
      .then(setWishes)
      .catch(() => setError('ไม่สามารถโหลดข้อมูลได้'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return wishes;
    return wishes.filter(
      (w) =>
        w.guestName.toLowerCase().includes(q) ||
        w.message.toLowerCase().includes(q),
    );
  }, [wishes, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageWishes = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-4">
      <header className="mb-2 flex flex-col gap-4 sm:mb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef2ea] text-[#6b7c5e]">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif-cg text-[1.35rem] font-medium text-[#1a3228] sm:text-[1.5rem]">
              คำอวยพร
            </h2>
            <p className="mt-1.5 text-[0.88rem] leading-relaxed text-[#8a8a8a]">
              อ่านข้อความอวยพรจากแขกที่ส่งมาพร้อมการตอบรับ
            </p>
          </div>
        </div>

        <WishSummaryCard count={wishes.length} />
      </header>

      <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-4 shadow-[0_4px_24px_rgba(30,58,58,0.05)] sm:p-5">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8a8a]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="ค้นหาจากชื่อหรือข้อความ..."
            className="w-full rounded-xl border border-[#e5e9e0] bg-[#faf8f4] py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#6b7c5e]"
          />
        </div>
        <p className="mt-3 text-[0.75rem] text-[#8a8a8a]">
          {search.trim() ? `พบ ${filtered.length} รายการ` : `ทั้งหมด ${wishes.length} รายการ`}
        </p>
      </div>

      {loading && (
        <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white py-16 text-center text-sm text-[#8a8a8a]">
          กำลังโหลด...
        </div>
      )}

      {error && (
        <div className="rounded-[1.25rem] border border-red-100 bg-red-50 py-10 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-[1.25rem] border border-dashed border-[#d5ddd0] bg-white/80 px-4 py-14 text-center">
          <AdminFloralDecor variant="empty" />
          <p className="mt-3 font-serif-cg text-[0.95rem] italic text-[#8a8a8a]">
            {search.trim() ? 'ไม่พบคำอวยพรที่ค้นหา' : 'ยังไม่มีการ์ดอวยพร'}
          </p>
        </div>
      )}

      {!loading && !error && pageWishes.length > 0 && (
        <div className="flex flex-col gap-3">
          {pageWishes.map((w) => (
            <WishCard key={w.id} wish={w} />
          ))}
        </div>
      )}

      {!loading && !error && (
        <WishPagination
          page={safePage}
          totalPages={totalPages}
          total={filtered.length}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
