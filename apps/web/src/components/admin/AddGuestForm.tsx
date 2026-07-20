'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { createAdminGuest } from '@/lib/api';
import { GUEST_CATEGORIES, type GuestCategory } from '@/lib/guestCategory';

function getToken(): string {
  const match = document.cookie.match(/admin-token=([^;]+)/);
  return match ? match[1] : '';
}

interface AddGuestFormProps {
  onCreated: () => void;
}

export function AddGuestForm({ onCreated }: AddGuestFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<GuestCategory | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit() {
    if (!displayName.trim()) {
      setError('กรุณากรอกชื่อบนการ์ด');
      return;
    }
    if (!category) {
      setError('กรุณาเลือกประเภทแขก');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createAdminGuest(getToken(), {
        displayName: displayName.trim(),
        category,
      });
      setDisplayName('');
      setCategory('');
      setSuccess('สร้างลิงก์เชิญเรียบร้อยแล้ว');
      onCreated();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(message);
      if (message.includes('เข้าสู่ระบบใหม่')) {
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      id="add-guest"
      className="scroll-mt-28 rounded-[1.25rem] border border-[#e5e9e0] bg-white p-5 shadow-[0_4px_24px_rgba(30,58,58,0.05)] sm:p-6"
    >
      <h3 className="font-serif-cg text-[1.05rem] font-medium text-[#1a3228]">
        สร้างการ์ดเชิญใหม่
      </h3>
      <p className="mt-1 text-[0.8rem] text-[#8a8a8a]">
        กรอกชื่อที่ต้องการแสดงบนการ์ด และเลือกประเภทแขก ระบบจะสร้างลิงก์เฉพาะให้แต่ละคน
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setError('');
            setSuccess('');
          }}
          placeholder="เช่น คุณสมชาย และครอบครัว"
          className="w-full rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-4 py-3 text-sm text-[#2c2c2c] outline-none transition-colors focus:border-[#6b7c5e] disabled:opacity-50"
          disabled={loading}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as GuestCategory | '');
              setError('');
              setSuccess('');
            }}
            disabled={loading}
            className="w-full rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-4 py-3 text-sm text-[#2c2c2c] outline-none transition-colors focus:border-[#6b7c5e] disabled:opacity-50 sm:flex-1"
          >
            <option value="">เลือกประเภทแขก</option>
            {GUEST_CATEGORIES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6b7c5e] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1a3228] disabled:opacity-50 sm:shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {loading ? 'กำลังสร้าง...' : 'สร้างลิงก์'}
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {success && <p className="mt-2 text-xs text-[#6b7c5e]">{success}</p>}
    </div>
  );
}
