'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileDown, Loader2, Plus, Search, Table2, X } from 'lucide-react';
import {
  createAdminSeatingGroup,
  getAdminSeatingPlan,
  searchAdminSeatingGuests,
  setAdminSeatingTableGuests,
  setAdminSeatingTablesGroup,
  updateAdminSeatingGroup,
} from '@/lib/api';
import { AdminSelect } from '@/components/admin/AdminSelect';
import { exportSeatingExcel } from '@/lib/exportSeatingExcel';
import type { SeatingGuestBrief, SeatingPlan, SeatingSpot } from '@/types';

function getToken(): string {
  const match = document.cookie.match(/admin-token=([^;]+)/);
  return match ? match[1] : '';
}

export function SeatingPlanPanel() {
  const [plan, setPlan] = useState<SeatingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [pendingGroupId, setPendingGroupId] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [customGroupName, setCustomGroupName] = useState('');
  const [customShortName, setCustomShortName] = useState('');
  const [editShortName, setEditShortName] = useState('');
  const [guestSearch, setGuestSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SeatingGuestBrief[]>([]);
  const [searching, setSearching] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  const selectedSpots = useMemo(
    () =>
      plan?.spots.filter(
        (s) => s.kind === 'TABLE' && selectedCodes.includes(s.code),
      ) ?? [],
    [plan, selectedCodes],
  );

  const singleSelected: SeatingSpot | null =
    selectedSpots.length === 1 ? selectedSpots[0] : null;

  const tables = useMemo(
    () => plan?.spots.filter((s) => s.kind === 'TABLE') ?? [],
    [plan],
  );
  const facilities = useMemo(
    () => plan?.spots.filter((s) => s.kind === 'FACILITY') ?? [],
    [plan],
  );

  const selectedGroup = useMemo(
    () => plan?.groups.find((g) => g.id === pendingGroupId) ?? null,
    [plan, pendingGroupId],
  );

  useEffect(() => {
    if (selectedSpots.length === 1 && selectedSpots[0].groupId) {
      setPendingGroupId(selectedSpots[0].groupId);
    } else if (selectedSpots.length === 0) {
      setPendingGroupId('');
    }
  }, [selectedCodes.join(','), selectedSpots.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setEditShortName(selectedGroup?.shortName ?? '');
  }, [selectedGroup?.id, selectedGroup?.shortName]);

  useEffect(() => {
    if (!singleSelected) {
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
  }, [guestSearch, singleSelected?.code]);

  function toggleTable(code: string) {
    setActionError('');
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  function patchSpots(updated: SeatingSpot[]) {
    const byCode = new Map(updated.map((s) => [s.code, s]));
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        spots: prev.spots.map((s) => byCode.get(s.code) ?? s),
      };
    });
  }

  async function handleApplyGroup(groupId: string | null) {
    if (!selectedCodes.length) {
      setActionError('กรุณาเลือกโต๊ะอย่างน้อย 1 ตัว');
      return;
    }
    setSaving(true);
    setActionError('');
    try {
      const updated = await setAdminSeatingTablesGroup(
        getToken(),
        selectedCodes,
        groupId,
      );
      patchSpots(updated);
      await load();
      if (groupId) setPendingGroupId(groupId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'บันทึกกลุ่มไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function handleExportExcel() {
    if (!plan) return;
    setExporting(true);
    setActionError('');
    try {
      await exportSeatingExcel(plan);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Export Excel ไม่สำเร็จ');
    } finally {
      setExporting(false);
    }
  }

  async function handleCreateGroup() {
    const name = customGroupName.trim();
    const shortName = customShortName.trim();
    if (!name) {
      setActionError('กรุณากรอกชื่อกลุ่ม');
      return;
    }
    if (!shortName) {
      setActionError('กรุณากรอกชื่อย่อ');
      return;
    }
    setSaving(true);
    setActionError('');
    try {
      const group = await createAdminSeatingGroup(getToken(), name, shortName);
      setCustomGroupName('');
      setCustomShortName('');
      setPendingGroupId(group.id);
      if (selectedCodes.length) {
        const updated = await setAdminSeatingTablesGroup(
          getToken(),
          selectedCodes,
          group.id,
        );
        patchSpots(updated);
      }
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'สร้างกลุ่มไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveShortName() {
    if (!selectedGroup) return;
    const shortName = editShortName.trim();
    if (!shortName) {
      setActionError('กรุณากรอกชื่อย่อ');
      return;
    }
    setSaving(true);
    setActionError('');
    try {
      await updateAdminSeatingGroup(getToken(), selectedGroup.id, { shortName });
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'บันทึกชื่อย่อไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleGuest(guestId: string) {
    if (!singleSelected) return;
    const current = singleSelected.guests.map((g) => g.id);
    const next = current.includes(guestId)
      ? current.filter((id) => id !== guestId)
      : [...current, guestId];
    setSaving(true);
    setActionError('');
    try {
      const updated = await setAdminSeatingTableGuests(
        getToken(),
        singleSelected.code,
        next,
      );
      patchSpots([updated]);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'บันทึกแขกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
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
            มีกลุ่ม (badge ชื่อย่อ)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#6b7c5e] ring-2 ring-[#d4b87a]" />
            มีรายชื่อคน / กำลังเลือก
          </span>
          <span className="ml-auto inline-flex items-center gap-2">
            <span>{tables.length} โต๊ะ</span>
            <button
              type="button"
              onClick={() => void handleExportExcel()}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#c5cfc5] bg-white px-2.5 py-1 text-[0.72rem] font-medium text-[#3d4f3a] transition-colors hover:bg-[#eef2ea] disabled:opacity-60"
            >
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Export Excel
            </button>
          </span>
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
            const isSelected = selectedCodes.includes(t.code);
            const hasGuests = t.guests.length > 0;
            const fill = t.groupColor ?? '#f3f0ea';
            const badge = t.groupShortName || t.code;
            const tip = t.groupName
              ? `${t.code} · ${t.groupName}${hasGuests ? ` · ${t.guests.length} คน` : ''}`
              : t.code;
            return (
              <button
                key={t.code}
                type="button"
                onClick={() => toggleTable(t.code)}
                className="absolute flex flex-col items-center justify-center gap-0 rounded-md border px-0.5 text-center transition-transform hover:z-10 hover:scale-105"
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
                title={tip}
              >
                <span className="text-[0.5rem] leading-none opacity-80 sm:text-[0.55rem]">
                  {t.code}
                </span>
                <span className="max-w-full truncate text-[0.58rem] font-semibold leading-tight sm:text-[0.68rem]">
                  {badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-4 shadow-[0_4px_24px_rgba(30,58,58,0.05)] sm:p-5">
          {selectedCodes.length === 0 ? (
            <div className="py-8 text-center">
              <Table2 className="mx-auto mb-2 h-6 w-6 text-[#6b7c5e]" />
              <p className="text-sm text-[#8a8a8a]">
                คลิกโต๊ะเพื่อเลือก (เลือกหลายตัวได้) แล้วติดกลุ่มพร้อมกัน
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[0.7rem] tracking-wide text-[#8a8a8a] uppercase">
                    เลือกแล้ว {selectedCodes.length} โต๊ะ
                  </p>
                  <h3 className="mt-1 font-serif-cg text-[1.1rem] leading-snug text-[#1a3228]">
                    {selectedCodes.slice().sort().join(', ')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCodes([])}
                  className="rounded-lg p-1.5 text-[#8a8a8a] hover:bg-[#f7f9f5]"
                  aria-label="ล้างการเลือก"
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
                  value={pendingGroupId}
                  onChange={setPendingGroupId}
                  disabled={saving}
                  options={[
                    { value: '', label: '— เลือกกลุ่ม —' },
                    ...plan.groups.map((g) => ({
                      value: g.id,
                      label: `${g.shortName} · ${g.name}${g.customName ? ' (กำหนดเอง)' : ''}`,
                    })),
                  ]}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={saving || !pendingGroupId}
                    onClick={() => void handleApplyGroup(pendingGroupId || null)}
                    className="rounded-xl bg-[#6b7c5e] px-3 py-2 text-sm text-white hover:bg-[#1a3228] disabled:opacity-50"
                  >
                    ติดกลุ่มกับโต๊ะที่เลือก
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleApplyGroup(null)}
                    className="rounded-xl border border-[#e5e9e0] px-3 py-2 text-sm text-[#5a6b55] hover:bg-[#f7f9f5] disabled:opacity-50"
                  >
                    เคลียร์กลุ่ม
                  </button>
                </div>
              </div>

              {selectedGroup && (
                <div className="mt-3 rounded-xl border border-[#e5e9e0] bg-[#faf8f4] p-3">
                  <p className="text-[0.7rem] text-[#8a8a8a]">
                    ชื่อย่อของกลุ่มนี้ (แก้แล้วโต๊ะที่ใช้กลุ่มนี้จะเปลี่ยนตาม)
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={editShortName}
                      onChange={(e) => setEditShortName(e.target.value)}
                      maxLength={20}
                      className="min-w-0 flex-1 rounded-lg border border-[#e5e9e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#6b7c5e]"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => void handleSaveShortName()}
                      disabled={saving}
                      className="rounded-lg bg-[#1a3228] px-3 py-2 text-sm text-white disabled:opacity-50"
                    >
                      บันทึก
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2 border-t border-[#eceee9] pt-4">
                <p className="text-[0.75rem] font-medium text-[#1a3228]">สร้างกลุ่มใหม่</p>
                <input
                  type="text"
                  value={customGroupName}
                  onChange={(e) => setCustomGroupName(e.target.value)}
                  placeholder="ชื่อเต็ม เช่น โต๊ะเจ้าภาพ"
                  className="w-full rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-3 py-2.5 text-sm outline-none focus:border-[#6b7c5e]"
                  disabled={saving}
                />
                <input
                  type="text"
                  value={customShortName}
                  onChange={(e) => setCustomShortName(e.target.value)}
                  placeholder="ชื่อย่อบนโต๊ะ เช่น เจ้าภาพ"
                  maxLength={20}
                  className="w-full rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-3 py-2.5 text-sm outline-none focus:border-[#6b7c5e]"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => void handleCreateGroup()}
                  disabled={saving}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#6b7c5e] px-3 py-2.5 text-sm text-white hover:bg-[#1a3228] disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  สร้างแล้วติดกับโต๊ะที่เลือก
                </button>
              </div>

              {selectedCodes.length > 1 ? (
                <p className="mt-5 border-t border-[#eceee9] pt-4 text-[0.72rem] text-[#8a8a8a]">
                  ระบุแขกเป็นรายชื่อได้เมื่อเลือกโต๊ะเดียวเท่านั้น
                </p>
              ) : singleSelected ? (
                <div className="mt-5 border-t border-[#eceee9] pt-4">
                  <p className="text-[0.75rem] font-medium text-[#1a3228]">
                    ระบุแขกเป็นรายชื่อ (ถ้าต้องแยกโต๊ะ)
                  </p>
                  <p className="mt-1 text-[0.7rem] text-[#8a8a8a]">
                    ส่วนใหญ่ติดกลุ่มพอ — ใช้เมื่อต้องแยกคนในกลุ่มเดียวกันลงต่างโต๊ะ
                  </p>

                  {singleSelected.guests.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {singleSelected.guests.map((g) => (
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
                        const onTable = singleSelected.guests.some((x) => x.id === g.id);
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
              ) : null}
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
                    className="mt-0.5 inline-flex h-5 min-w-[2rem] shrink-0 items-center justify-center rounded px-1 text-[0.65rem] font-semibold text-white"
                    style={{ backgroundColor: g.color }}
                    title={g.name}
                  >
                    {g.shortName}
                  </span>
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
