'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';
import {
  getAdminSettings,
  updateAdminSettings,
  uploadPaymentQr,
} from '@/lib/api';
import type { TimelineItem, WeddingSettings } from '@/types';

function getToken(): string {
  const match = document.cookie.match(/admin-token=([^;]+)/);
  return match ? match[1] : '';
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString();
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-[#8a8a8a]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-3.5 py-2.5 text-sm text-[#2c2c2c] outline-none transition-colors focus:border-[#6b7c5e]';

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-5 shadow-[0_4px_24px_rgba(30,58,58,0.05)] sm:p-6">
      <h3 className="mb-4 text-sm font-medium text-[#1a3228]">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function EventInfoEditor() {
  const [form, setForm] = useState<WeddingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAdminSettings(getToken())
      .then(setForm)
      .catch(() => setError('ไม่สามารถโหลดข้อมูลได้'))
      .finally(() => setLoading(false));
  }, []);

  function updateField<K extends keyof WeddingSettings>(key: K, value: WeddingSettings[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSuccess('');
  }

  function updateTimeline(index: number, patch: Partial<TimelineItem>) {
    setForm((prev) => {
      if (!prev) return prev;
      const timeline = prev.timeline.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      );
      return { ...prev, timeline };
    });
    setSuccess('');
  }

  function addTimelineRow() {
    setForm((prev) =>
      prev ? { ...prev, timeline: [...prev.timeline, { time: '', event: '' }] } : prev,
    );
  }

  function removeTimelineRow(index: number) {
    setForm((prev) =>
      prev
        ? { ...prev, timeline: prev.timeline.filter((_, i) => i !== index) }
        : prev,
    );
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const accountName = (form.bankAccountName ?? form.promptpayName ?? '').trim();
      const updated = await updateAdminSettings(getToken(), {
        groomName: form.groomName,
        groomNickname: form.groomNickname,
        brideName: form.brideName,
        brideNickname: form.brideNickname,
        weddingDate: form.weddingDate,
        venue: form.venue,
        city: form.city,
        lineOaId: form.lineOaId,
        lineOaUrl: form.lineOaUrl,
        rsvpContactPhone: form.rsvpContactPhone,
        mapsUrl: form.mapsUrl,
        rsvpDeadline: form.rsvpDeadline,
        promptpay: form.promptpay,
        promptpayName: accountName || undefined,
        bankName: form.bankName,
        bankAccountNumber: form.bankAccountNumber,
        bankAccountName: accountName || undefined,
        timeline: form.timeline.filter((t) => t.time.trim() && t.event.trim()),
      });
      setForm(updated);
      setSuccess('บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ';
      setError(message);
      if (message.includes('เข้าสู่ระบบใหม่')) {
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 1500);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleQrUpload(file: File) {
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const updated = await uploadPaymentQr(getToken(), file);
      setForm(updated);
      setSuccess('อัปโหลด QR Code เรียบร้อยแล้ว');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white py-16 text-center text-sm text-[#8a8a8a]">
        กำลังโหลด...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="rounded-[1.25rem] border border-red-100 bg-red-50 py-10 text-center text-sm text-red-500">
        {error || 'ไม่พบข้อมูล'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionCard title="คู่บ่าวสาว">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อเจ้าสาว">
            <input
              className={inputClass}
              value={form.brideName}
              onChange={(e) => updateField('brideName', e.target.value)}
            />
          </Field>
          <Field label="ชื่อเล่นเจ้าสาว">
            <input
              className={inputClass}
              value={form.brideNickname}
              onChange={(e) => updateField('brideNickname', e.target.value)}
            />
          </Field>
          <Field label="ชื่อเจ้าบ่าว">
            <input
              className={inputClass}
              value={form.groomName}
              onChange={(e) => updateField('groomName', e.target.value)}
            />
          </Field>
          <Field label="ชื่อเล่นเจ้าบ่าว">
            <input
              className={inputClass}
              value={form.groomNickname}
              onChange={(e) => updateField('groomNickname', e.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="วันและสถานที่">
        <Field label="วันและเวลางาน">
          <input
            type="datetime-local"
            className={inputClass}
            value={toDatetimeLocal(form.weddingDate)}
            onChange={(e) => updateField('weddingDate', fromDatetimeLocal(e.target.value))}
          />
        </Field>
        <Field label="สถานที่">
          <input
            className={inputClass}
            value={form.venue}
            onChange={(e) => updateField('venue', e.target.value)}
          />
        </Field>
        <Field label="ที่อยู่ / รายละเอียดสถานที่">
          <input
            className={inputClass}
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
          />
        </Field>
        <Field label="ลิงก์ Google Maps">
          <input
            className={inputClass}
            value={form.mapsUrl}
            onChange={(e) => updateField('mapsUrl', e.target.value)}
          />
        </Field>
        <Field label="กำหนดตอบรับภายใน">
          <input
            type="datetime-local"
            className={inputClass}
            value={toDatetimeLocal(form.rsvpDeadline)}
            onChange={(e) => updateField('rsvpDeadline', fromDatetimeLocal(e.target.value))}
          />
        </Field>
      </SectionCard>

      <SectionCard title="ติดต่อ">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="LINE OA ID">
            <input
              className={inputClass}
              value={form.lineOaId}
              onChange={(e) => updateField('lineOaId', e.target.value)}
            />
          </Field>
          <Field label="เบอร์ติดต่อ">
            <input
              className={inputClass}
              value={form.rsvpContactPhone}
              onChange={(e) => updateField('rsvpContactPhone', e.target.value)}
            />
          </Field>
        </div>
        <Field label="ลิงก์ LINE OA">
          <input
            className={inputClass}
            value={form.lineOaUrl}
            onChange={(e) => updateField('lineOaUrl', e.target.value)}
          />
        </Field>
      </SectionCard>

      <SectionCard title="กำหนดการ">
        <div className="space-y-3">
          {form.timeline.map((item, index) => (
            <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="sm:w-28">
                <Field label={index === 0 ? 'เวลา' : ''}>
                  <input
                    className={inputClass}
                    placeholder="14:00"
                    value={item.time}
                    onChange={(e) => updateTimeline(index, { time: e.target.value })}
                  />
                </Field>
              </div>
              <div className="min-w-0 flex-1">
                <Field label={index === 0 ? 'กิจกรรม' : ''}>
                  <input
                    className={inputClass}
                    placeholder="พิธี..."
                    value={item.event}
                    onChange={(e) => updateTimeline(index, { event: e.target.value })}
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={() => removeTimelineRow(index)}
                className="mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e5e9e0] text-[#8a8a8a] hover:border-red-200 hover:text-red-500"
                aria-label="ลบรายการ"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addTimelineRow}
          className="inline-flex items-center gap-1.5 text-sm text-[#6b7c5e] hover:text-[#1a3228]"
        >
          <Plus className="h-4 w-4" />
          เพิ่มรายการ
        </button>
      </SectionCard>

      <SectionCard title="การชำระเงิน / ช่วยงาน">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ธนาคาร">
            <input
              className={inputClass}
              placeholder="เช่น กสิกรไทย"
              value={form.bankName ?? ''}
              onChange={(e) => updateField('bankName', e.target.value)}
            />
          </Field>
          <Field label="เลขที่บัญชี">
            <input
              className={inputClass}
              placeholder="xxx-x-xxxxx-x"
              value={form.bankAccountNumber ?? ''}
              onChange={(e) => updateField('bankAccountNumber', e.target.value)}
            />
          </Field>
          <Field label="ชื่อบัญชี">
            <input
              className={inputClass}
              value={form.bankAccountName ?? ''}
              onChange={(e) => updateField('bankAccountName', e.target.value)}
            />
          </Field>
          <Field label="พร้อมเพย์ (เบอร์)">
            <input
              className={inputClass}
              value={form.promptpay ?? ''}
              onChange={(e) => updateField('promptpay', e.target.value)}
            />
          </Field>
        </div>

        <div>
          <span className="mb-2 block text-xs text-[#8a8a8a]">QR Code ชำระเงิน</span>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-xl border-2 border-[#e5e9e0] bg-[#faf8f4]">
              {form.paymentQrUrl ? (
                <Image
                  src={form.paymentQrUrl}
                  alt="QR Code ชำระเงิน"
                  width={140}
                  height={140}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              ) : (
                <span className="px-3 text-center text-xs text-[#8a8a8a]">ยังไม่มี QR Code</span>
              )}
            </div>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleQrUpload(file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-4 py-2.5 text-sm text-[#1a3228] transition-colors hover:border-[#c5cfc5] disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 text-[#6b7c5e]" />
                )}
                {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลด QR Code'}
              </button>
              <p className="mt-2 text-[0.72rem] text-[#8a8a8a]">รองรับ JPG, PNG, WEBP ไม่เกิน 2 MB</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-[#d8ead8] bg-[#eef5eb] px-4 py-2.5 text-xs text-[#3d6b45]">
          {success}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6b7c5e] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1a3228] disabled:opacity-50 sm:w-auto"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
      </button>
    </div>
  );
}
