'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Search, Table2, X } from 'lucide-react';
import {
  createAdminSeatingGroup,
  getAdminSeatingPlan,
  searchAdminSeatingGuests,
  setAdminSeatingTableGroup,
  setAdminSeatingTableGuests,
} from '@/lib/api';
import { AdminSelect } from '@/components/admin/AdminSelect';
import type { SeatingGuestBrief, SeatingPlan, SeatingSpot } from '@/types';

function getToken(): string {
  const match = document.cookie.match(/admin-token=([^;]+)/);
  return match ? match[1] : '';
}

export function SeatingPlanPanel() {
  const [plan, setPlan] = useState<SeatingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [customGroupName, setCustomGroupName] = useState('');
  const [guestSearch, setGuestSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SeatingGuestBrief[]>([]);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminSeatingPlan(getToken());
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดผังโต๊ะไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => plan?.spots.find((s) => s.code === selectedCode && s.kind === 'TABLE') ?? null,
    [plan, selectedCode],
  );

  const tables = useMemo(
    () => plan?.spots.filter((s) => s.kind === 'TABLE') ?? [],
    [plan],
  );
  const facilities = useMemo(
    () => plan?.spots.filter((s) => s.kind === 'FACILITY') ?? [],
    [plan],
  );

  useEffect(() => {
    if (!selected) {
      setSearchResults([]);
      return;
    }
    const q = guestSearch.trim();
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }
    const handle = window.setTimeout(() => {
      setSearching(true);
      searchAdminSeatingGuests(getToken(), { search: q })
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [guestSearch, selected]);

  async function handleSetGroup(groupId: string | null) {
    if (!selected) return;
    setSaving(true);
    setActionError('');
    try {
      const updated = await setAdminSeatingTableGroup(getToken(), selected.code, groupId);
      patchSpot(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'บันทึกกลุ่มไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateGroup() {
    const name = customGroupName.trim();
    if (!name) {
      setActionError('กรุณากรอกชื่อกลุ่ม');
      return;
    }
    setSaving(true);
    setActionError('');
    try {
      const group = await createAdminSeatingGroup(getToken(), name);
      setCustomGroupName('');
      await load();
      if (selected) {
        const updated = await setAdminSeatingTableGroup(getToken(), selected.code, group.id);
        patchSpot(updated);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'สร้างกลุ่มไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleGuest(guestId: string) {
    if (!selected) return;
    const current = selected.guests.map((g) => g.id);
    const next = current.includes(guestId)
      ? current.filter((id) => id !== guestId)
      : [...current, guestId];
    setSaving(true);
    setActionError('');
    try {
      const updated = await setAdminSeatingTableGuests(getToken(), selected.code, next);
      patchSpot(updated);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'บันทึกแขกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  function patchSpot(updated: SeatingSpot) {
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        spots: prev.spots.map((s) => (s.code === updated.code ? updated : s)),
      };
    });
  }

  if (loading) {
    return (
      <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white py-16 text-center text-sm text-[#8a8a8a]">
        <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-[#6b7c5e]" />
        กำลังโหลดผังโต๊ะ...
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="rounded-[1.25rem] border border-red-100 bg-red-50 py-10 text-center">
        <p className="text-sm text-red-500">{error || 'ไม่พบข้อมูล'}</p>
        <button type="button" onClick={() => void load()} className="mt-2 text-sm text-[#6b7c5e] underline">
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.85fr)]">
      <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-3 shadow-[0_4px_24px_rgba(30,58,58,0.05)] sm:p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-[0.72rem] text-[#8a8a8a]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-[#c5cfc5] bg-[#f3f0ea]" />
            ว่าง
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#6b7c5e]" />
            มีกลุ่ม
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#6b7c5e] ring-2 ring-[#d4b87a]" />
            มีรายชื่อคน
          </span>
          <span className="ml-auto">{tables.length} โต๊ะ</span>
        </div>

        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-[#e5e9e0] bg-[#f7f4ee]">
          {facilities.map((f) => (
            <div
              key={f.code}
              className="pointer-events-none absolute flex items-center justify-center overflow-hidden rounded-md border border-dashed border-[#c5cfc5] bg-[#eef2ea]/80 px-0.5 text-center text-[0.45rem] leading-tight text-[#5a6b55] sm:text-[0.55rem]"
              style={{
                left: `${f.xPercent}%`,
                top: `${f.yPercent}%`,
                width: `${f.widthPercent}%`,
                height: `${f.heightPercent}%`,
              }}
              title={f.label}
            >
              <span className="line-clamp-3">{f.label}</span>
            </div>
          ))}

          {tables.map((t) => {
            const isSelected = selectedCode === t.code;
            const hasGuests = t.guests.length > 0;
            const fill = t.groupColor ?? '#f3f0ea';
            return (
              <button
                key={t.code}
                type="button"
                onClick={() => setSelectedCode(t.code)}
                className="absolute flex items-center justify-center rounded-md border text-[0.58rem] font-medium transition-transform hover:z-10 hover:scale-105 sm:text-[0.68rem]"
                style={{
                  left: `${t.xPercent}%`,
                  top: `${t.yPercent}%`,
                  width: `${t.widthPercent}%`,
                  height: `${t.heightPercent}%`,
                  backgroundColor: t.groupId ? fill : '#f3f0ea',
                  color: t.groupId ? '#fff' : '#1a3228',
                  borderColor: isSelected ? '#d4b87a' : t.groupId ? fill : '#c5cfc5',
                  boxShadow: isSelected
                    ? '0 0 0 2px #d4b87a'
                    : hasGuests
                      ? '0 0 0 2px rgba(212,184,122,0.85)'
                      : undefined,
                }}
                title={
                  t.groupName
                    ? `${t.code} · ${t.groupName}${hasGuests ? ` · ${t.guests.length} คน` : ''}`
                    : t.code
                }
              >
                {t.code}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-4 shadow-[0_4px_24px_rgba(30,58,58,0.05)] sm:p-5">
          {!selected ? (
            <div className="py-8 text-center">
              <Table2 className="mx-auto mb-2 h-6 w-6 text-[#6b7c5e]" />
              <p className="text-sm text-[#8a8a8a]">คลิกโต๊ะบนผังเพื่อตั้งกลุ่มหรือระบุแขก</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[0.7rem] tracking-wide text-[#8a8a8a] uppercase">โต๊ะ</p>
                  <h3 className="font-serif-cg text-[1.35rem] text-[#1a3228]">{selected.code}</h3>
                  {selected.groupName && (
                    <p className="mt-1 text-sm text-[#6b7c5e]">{selected.groupName}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCode(null)}
                  className="rounded-lg p-1.5 text-[#8a8a8a] hover:bg-[#f7f9f5]"
                  aria-label="ปิด"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {actionError && (
                <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {actionError}
                </p>
              )}

              <div className="mt-4 space-y-2">
                <label className="text-[0.75rem] font-medium text-[#1a3228]">กลุ่มป้ายโต๊ะ</label>
                <AdminSelect
                  value={selected.groupId ?? ''}
                  onChange={(v) => void handleSetGroup(v || null)}
                  disabled={saving}
                  options={[
                    { value: '', label: '— ไม่ระบุกลุ่ม —' },
                    ...plan.groups.map((g) => ({
                      value: g.id,
                      label: `${g.name}${g.customName ? ' (กำหนดเอง)' : ''}`,
                    })),
                  ]}
                />
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customGroupName}
                  onChange={(e) => setCustomGroupName(e.target.value)}
                  placeholder="สร้างกลุ่มใหม่ เช่น โต๊ะเจ้าภาพ"
                  className="min-w-0 flex-1 rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-3 py-2.5 text-sm outline-none focus:border-[#6b7c5e]"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => void handleCreateGroup()}
                  disabled={saving}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#6b7c5e] px-3 py-2.5 text-sm text-white hover:bg-[#1a3228] disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่ม
                </button>
              </div>

              <div className="mt-5 border-t border-[#eceee9] pt-4">
                <p className="text-[0.75rem] font-medium text-[#1a3228]">ระบุแขกเป็นรายชื่อ (ถ้าต้องแยกโต๊ะ)</p>
                <p className="mt-1 text-[0.7rem] text-[#8a8a8a]">
                  ส่วนใหญ่ติดกลุ่มพอ — ใช้ส่วนนี้เมื่อต้องแยกคนในกลุ่มเดียวกันลงต่างโต๊ะ
                </p>

                {selected.guests.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {selected.guests.map((g) => (
                      <li
                        key={g.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-[#f7f9f5] px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 truncate text-[#2c2c2c]">{g.displayName}</span>
                        <button
                          type="button"
                          onClick={() => void handleToggleGuest(g.id)}
                          disabled={saving}
                          className="shrink-0 text-xs text-red-500 hover:underline"
                        >
                          ลบ
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a8a8a]" />
                  <input
                    type="text"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="ค้นหาชื่อแขก..."
                    className="w-full rounded-xl border border-[#e5e9e0] bg-[#faf8f4] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#6b7c5e]"
                  />
                </div>
                {searching && (
                  <p className="mt-2 text-[0.7rem] text-[#8a8a8a]">กำลังค้นหา...</p>
                )}
                {searchResults.length > 0 && (
                  <ul className="mt-2 max-h-40 overflow-auto rounded-xl border border-[#e5e9e0]">
                    {searchResults.map((g) => {
                      const onTable = selected.guests.some((x) => x.id === g.id);
                      return (
                        <li key={g.id}>
                          <button
                            type="button"
                            onClick={() => void handleToggleGuest(g.id)}
                            disabled={saving}
                            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-[#faf8f4]"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-[#2c2c2c]">{g.displayName}</span>
                              {g.categoryName && (
                                <span className="block truncate text-[0.65rem] text-[#8a8a8a]">
                                  {g.categoryName}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 text-[0.7rem] text-[#6b7c5e]">
                              {onTable ? 'เอาออก' : 'เพิ่ม'}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-4 shadow-[0_4px_24px_rgba(30,58,58,0.05)] sm:p-5">
          <h4 className="font-serif-cg text-[1.05rem] text-[#1a3228]">สรุปตามกลุ่ม</h4>
          <ul className="mt-3 max-h-56 space-y-2 overflow-auto text-sm">
            {plan.groups.filter((g) => g.tableCodes.length > 0).length === 0 && (
              <li className="text-[#8a8a8a]">ยังไม่ได้ติดกลุ่มโต๊ะ</li>
            )}
            {plan.groups
              .filter((g) => g.tableCodes.length > 0)
              .map((g) => (
                <li key={g.id} className="flex items-start gap-2">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: g.color }}
                  />
                  <span>
                    <span className="font-medium text-[#1a3228]">{g.name}</span>
                    <span className="mt-0.5 block text-[0.72rem] text-[#8a8a8a]">
                      {g.tableCodes.join(', ')}
                    </span>
                  </span>
                </li>
              ))}
          </ul>
          <p className="mt-4 text-[0.72rem] text-[#8a8a8a]">
            แขกที่ยังไม่มีโต๊ะ (จากรายชื่อที่ตอบมางาน/ยังไม่ตอบ): {plan.unassignedGuests.length} คน
          </p>
        </div>
      </aside>
    </div>
  );
}
