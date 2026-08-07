'use client';

import { useEffect, useState } from 'react';
import { Plus, Tags } from 'lucide-react';
import { createAdminGuest, getAdminGuestCategories } from '@/lib/api';
import { AdminSelect } from '@/components/admin/AdminSelect';
import type { GuestCategory, InviteLocale } from '@/types';

function getToken(): string {
  const match = document.cookie.match(/admin-token=([^;]+)/);
  return match ? match[1] : '';
}

interface AddGuestFormProps {
  onCreated: () => void;
}

export function AddGuestForm({ onCreated }: AddGuestFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locale, setLocale] = useState<InviteLocale>('TH');
  const [categories, setCategories] = useState<GuestCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getAdminGuestCategories(getToken())
      .then(setCategories)
      .catch(() => setError('ไม่สามารถโหลดประเภทแขกได้'));
  }, []);

  async function handleSubmit() {
    if (!displayName.trim()) {
      setError('กรุณากรอกชื่อบนการ์ด');
      return;
    }
    if (!categoryId) {
      setError('กรุณาเลือกประเภทแขก');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createAdminGuest(getToken(), {
        displayName: displayName.trim(),
        categoryId,
        locale,
      });
      setDisplayName('');
      setCategoryId('');
      setLocale('TH');
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
        กรอกชื่อที่ต้องการแสดงบนการ์ด เลือกประเภทแขก และภาษาการ์ด ระบบจะสร้างลิงก์เฉพาะให้แต่ละคน
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <AdminSelect
            value={categoryId}
            onChange={(value) => {
              setCategoryId(value);
              setError('');
              setSuccess('');
            }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="เลือกประเภทแขก"
            leadingIcon={Tags}
            disabled={loading || categories.length === 0}
            className="sm:flex-1"
          />

          <AdminSelect
            value={locale}
            onChange={(value) => {
              setLocale(value as InviteLocale);
              setError('');
              setSuccess('');
            }}
            options={[
              { value: 'TH', label: 'การ์ดภาษาไทย' },
              { value: 'EN', label: 'English card' },
            ]}
            disabled={loading}
            className="sm:w-44"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || categories.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6b7c5e] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1a3228] disabled:opacity-50 sm:shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {loading ? 'กำลังสร้าง...' : 'สร้างลิงก์'}
          </button>
        </div>

        {categories.length === 0 && (
          <p className="text-xs text-[#8a8a8a]">
            ยังไม่มีประเภทแขก — ไปเพิ่มที่หน้า{' '}
            <a href="/admin/info" className="text-[#6b7c5e] underline">
              ข้อมูลงาน
            </a>{' '}
            ก่อน
          </p>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {success && <p className="mt-2 text-xs text-[#6b7c5e]">{success}</p>}
    </div>
  );
}
