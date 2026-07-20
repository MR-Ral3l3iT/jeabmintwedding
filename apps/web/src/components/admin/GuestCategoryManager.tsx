'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  createAdminGuestCategory,
  deleteAdminGuestCategory,
  getAdminGuestCategories,
  updateAdminGuestCategory,
} from '@/lib/api';
import type { GuestCategory } from '@/types';

function getToken(): string {
  const match = document.cookie.match(/admin-token=([^;]+)/);
  return match ? match[1] : '';
}

export function GuestCategoryManager() {
  const [categories, setCategories] = useState<GuestCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminGuestCategories(getToken());
      setCategories(data);
    } catch {
      setError('ไม่สามารถโหลดประเภทแขกได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  async function handleAdd() {
    const name = newName.trim();
    if (!name) {
      setError('กรุณากรอกชื่อประเภทแขก');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await createAdminGuestCategory(getToken(), name);
      setNewName('');
      setSuccess('เพิ่มประเภทแขกเรียบร้อยแล้ว');
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เพิ่มไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(category: GuestCategory) {
    setEditingId(category.id);
    setEditName(category.name);
    setError('');
    setSuccess('');
  }

  async function saveEdit(id: string) {
    const name = editName.trim();
    if (!name) {
      setError('กรุณากรอกชื่อประเภทแขก');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateAdminGuestCategory(getToken(), id, { name });
      setEditingId(null);
      setEditName('');
      setSuccess('แก้ไขประเภทแขกเรียบร้อยแล้ว');
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'แก้ไขไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('ลบประเภทแขกนี้?')) return;
    setError('');
    setSuccess('');
    try {
      await deleteAdminGuestCategory(getToken(), id);
      setSuccess('ลบประเภทแขกเรียบร้อยแล้ว');
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ลบไม่สำเร็จ');
    }
  }

  return (
    <section className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-5 shadow-[0_4px_24px_rgba(30,58,58,0.05)] sm:p-6">
      <h3 className="mb-1 text-sm font-medium text-[#1a3228]">ประเภทแขก</h3>
      <p className="mb-4 text-[0.8rem] text-[#8a8a8a]">
        เพิ่ม/แก้ไขประเภทเพื่อใช้ตอนสร้างลิงก์เชิญ กรองรายชื่อ และปริ้นรายชื่อผู้ร่วมงาน
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            setError('');
            setSuccess('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleAdd();
            }
          }}
          placeholder="เช่น เพื่อนเจ้าบ่าว"
          className="w-full rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-3.5 py-2.5 text-sm text-[#2c2c2c] outline-none transition-colors focus:border-[#6b7c5e] sm:flex-1"
          disabled={saving}
        />
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6b7c5e] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a3228] disabled:opacity-50 sm:shrink-0"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          เพิ่มประเภท
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
      {success && <p className="mt-3 text-xs text-[#3d6b45]">{success}</p>}

      <div className="mt-4 space-y-2">
        {loading && <p className="text-sm text-[#8a8a8a]">กำลังโหลด...</p>}

        {!loading && categories.length === 0 && (
          <p className="rounded-xl border border-dashed border-[#d5ddd0] px-4 py-6 text-center text-sm text-[#8a8a8a]">
            ยังไม่มีประเภทแขก — เพิ่มรายการด้านบนได้เลย
          </p>
        )}

        {categories.map((category) => {
          const isEditing = editingId === category.id;
          return (
            <div
              key={category.id}
              className="flex items-center gap-2 rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-3.5 py-2.5"
            >
              {isEditing ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void saveEdit(category.id);
                      }
                      if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-[#e5e9e0] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#6b7c5e]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => void saveEdit(category.id)}
                    className="text-[#6b7c5e] hover:text-[#1a3228]"
                    aria-label="บันทึก"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-[#8a8a8a] hover:text-[#2c2c2c]"
                    aria-label="ยกเลิก"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="min-w-0 flex-1 text-sm text-[#2c2c2c]">{category.name}</span>
                  <button
                    type="button"
                    onClick={() => startEdit(category)}
                    className="text-[#8a8a8a] hover:text-[#6b7c5e]"
                    aria-label="แก้ไข"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(category.id)}
                    className="text-[#8a8a8a] hover:text-red-500"
                    aria-label="ลบ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
