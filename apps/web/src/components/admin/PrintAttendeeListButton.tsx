'use client';

import { useState } from 'react';
import { Loader2, Printer } from 'lucide-react';
import { getAdminGuests, getAdminGuestCategories } from '@/lib/api';
import {
  closePrintWindow,
  openPrintWindow,
  renderPrintAttendeeList,
} from '@/lib/printAttendeeList';

function getToken(): string {
  const match = document.cookie.match(/admin-token=([^;]+)/);
  return match ? match[1] : '';
}

export function PrintAttendeeListButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePrint() {
    if (loading) return;

    const printWindow = openPrintWindow();
    if (!printWindow) {
      setError('ไม่สามารถเปิดหน้าต่างพิมพ์ได้ กรุณาอนุญาต popup');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [res, categories] = await Promise.all([
        getAdminGuests(getToken(), {
          status: 'attending',
          limit: 200,
          sort: 'rsvp',
        }),
        getAdminGuestCategories(getToken()),
      ]);

      if (res.data.length === 0) {
        closePrintWindow(printWindow);
        setError('ยังไม่มีรายชื่อผู้เข้าร่วมงาน');
        return;
      }

      renderPrintAttendeeList(printWindow, res.data, categories);
    } catch (err) {
      closePrintWindow(printWindow);
      setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดรายชื่อได้');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-stretch sm:items-end">
      <button
        type="button"
        onClick={handlePrint}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-4 py-2.5 text-[0.82rem] font-medium text-[#1a3228] transition-colors hover:border-[#c5cfc5] hover:bg-[#f3f5f0] disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#6b7c5e]" aria-hidden="true" />
        ) : (
          <Printer className="h-4 w-4 text-[#6b7c5e]" aria-hidden="true" />
        )}
        ปริ้นรายชื่อผู้เข้าร่วมงาน
      </button>
      {error && <p className="mt-1.5 text-right text-[0.72rem] text-red-500">{error}</p>}
    </div>
  );
}
