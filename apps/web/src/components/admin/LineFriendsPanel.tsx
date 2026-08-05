'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Link2, Link2Off, Loader2, MessageCircle, Pencil, X } from 'lucide-react';
import {
  getAdminGuests,
  getAdminLineFriends,
  linkAdminLineFriend,
  unlinkAdminLineFriend,
  updateAdminGuest,
} from '@/lib/api';
import { AdminSelect } from '@/components/admin/AdminSelect';
import { formatThaiDate } from '@/lib/utils';
import type { Guest, LineFriend, PartySide } from '@/types';

function getToken(): string {
  const match = document.cookie.match(/admin-token=([^;]+)/);
  return match ? match[1] : '';
}

function partySideLabel(side?: PartySide): string {
  if (side === 'GROOM') return 'ฝั่งเจ้าบ่าว';
  if (side === 'BRIDE') return 'ฝั่งเจ้าสาว';
  return 'ยังไม่ระบุ';
}

export function LineFriendsPanel() {
  const [linked, setLinked] = useState<LineFriend[]>([]);
  const [unlinked, setUnlinked] = useState<LineFriend[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Record<string, string>>({});
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPartySide, setEditPartySide] = useState<PartySide | ''>('');
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [linkedRows, unlinkedRows, guestRes] = await Promise.all([
        getAdminLineFriends(getToken(), { linked: 'linked' }),
        getAdminLineFriends(getToken(), { linked: 'unlinked' }),
        getAdminGuests(getToken(), { limit: 200 }),
      ]);
      setLinked(linkedRows);
      setUnlinked(unlinkedRows);
      setGuests(guestRes.data);
    } catch {
      setError('ไม่สามารถโหลดข้อมูล LINE ได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(friend: LineFriend) {
    if (!friend.guestId) return;
    setEditingGuestId(friend.guestId);
    setEditName(friend.guestName ?? '');
    setEditPartySide(friend.guestPartySide ?? '');
    setError('');
  }

  function cancelEdit() {
    setEditingGuestId(null);
    setEditName('');
    setEditPartySide('');
  }

  async function saveEdit(guestId: string) {
    const name = editName.trim();
    if (!name) {
      setError('กรุณากรอกชื่อที่ตั้ง');
      return;
    }
    if (!editPartySide) {
      setError('กรุณาเลือกฝั่ง');
      return;
    }

    setSavingEdit(true);
    setError('');
    try {
      await updateAdminGuest(getToken(), guestId, {
        name,
        partySide: editPartySide,
      });
      cancelEdit();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleLink(friendId: string) {
    const guestId = selectedGuest[friendId];
    if (!guestId) {
      setError('กรุณาเลือกแขกที่จะผูก');
      return;
    }
    setLinkingId(friendId);
    setError('');
    try {
      await linkAdminLineFriend(getToken(), friendId, guestId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ผูกไม่สำเร็จ');
    } finally {
      setLinkingId(null);
    }
  }

  async function handleUnlink(friendId: string) {
    if (!confirm('ยกเลิกการเชื่อมบัญชี LINE นี้?')) return;
    setLinkingId(friendId);
    setError('');
    try {
      await unlinkAdminLineFriend(getToken(), friendId);
      cancelEdit();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ยกเลิกไม่สำเร็จ');
    } finally {
      setLinkingId(null);
    }
  }

  const unlinkedGuests = guests.filter((g) => !g.lineUserId);

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
          {error}
        </p>
      )}

      {loading && (
        <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white py-16 text-center text-sm text-[#8a8a8a]">
          กำลังโหลด...
        </div>
      )}

      {!loading && (
        <>
          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="font-medium text-[#1a3228]">รายชื่อที่ผูก LINE แล้ว</h3>
                <p className="mt-0.5 text-[0.75rem] text-[#8a8a8a]">
                  แก้ไขได้เฉพาะชื่อที่ตั้งและฝั่งเจ้าบ่าว/เจ้าสาว
                </p>
              </div>
              <p className="text-[0.75rem] text-[#8a8a8a]">{linked.length} คน</p>
            </div>

            {linked.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-[#d5ddd0] bg-white px-4 py-12 text-center text-sm text-[#8a8a8a]">
                ยังไม่มีรายชื่อที่ผูก LINE
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-[1.25rem] border border-[#e5e9e0] bg-white shadow-[0_4px_24px_rgba(30,58,58,0.05)] md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead className="border-b border-[#e5e9e0] bg-[#f7f9f5]">
                        <tr>
                          <th className="px-5 py-3.5 text-left font-medium text-[#1a3228]">โปรไฟล์</th>
                          <th className="px-5 py-3.5 text-left font-medium text-[#1a3228]">LINE ID</th>
                          <th className="px-5 py-3.5 text-left font-medium text-[#1a3228]">ชื่อที่ตั้ง</th>
                          <th className="px-5 py-3.5 text-left font-medium text-[#1a3228]">ฝั่ง</th>
                          <th className="px-5 py-3.5 text-right font-medium text-[#1a3228]">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eceee9]">
                        {linked.map((friend) => {
                          const isEditing = editingGuestId === friend.guestId;
                          return (
                            <tr key={friend.id} className="transition-colors hover:bg-[#faf8f4]/60">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <ProfileAvatar friend={friend} />
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-[#1a3228]">
                                      {friend.displayName ?? 'ไม่ระบุชื่อ LINE'}
                                    </p>
                                    {!friend.isFollowing && (
                                      <p className="text-[0.65rem] text-[#b05a5a]">เลิกติดตามแล้ว</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <p className="max-w-[12rem] break-all font-mono text-[0.7rem] text-[#8a8a8a]">
                                  {friend.lineUserId}
                                </p>
                              </td>
                              <td className="px-5 py-4">
                                {isEditing ? (
                                  <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    maxLength={100}
                                    className="w-full max-w-[10rem] rounded-lg border border-[#e5e9e0] px-2.5 py-1.5 text-sm outline-none focus:border-[#6b7c5e]"
                                    disabled={savingEdit}
                                  />
                                ) : (
                                  <span className="text-[#2c2c2c]">
                                    {friend.guestName ?? '—'}
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                {isEditing ? (
                                  <AdminSelect
                                    value={editPartySide}
                                    onChange={(v) => setEditPartySide(v as PartySide)}
                                    options={[
                                      { value: 'GROOM', label: 'ฝั่งเจ้าบ่าว' },
                                      { value: 'BRIDE', label: 'ฝั่งเจ้าสาว' },
                                    ]}
                                    placeholder="เลือกฝั่ง"
                                    className="min-w-[8.5rem]"
                                  />
                                ) : (
                                  <span
                                    className={
                                      friend.guestPartySide
                                        ? 'inline-flex rounded-full bg-[#eef5eb] px-2.5 py-1 text-xs text-[#3d6b45]'
                                        : 'text-xs text-[#8a8a8a]'
                                    }
                                  >
                                    {partySideLabel(friend.guestPartySide)}
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-right">
                                {isEditing && friend.guestId ? (
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      type="button"
                                      disabled={savingEdit}
                                      onClick={() => void saveEdit(friend.guestId!)}
                                      className="text-[#6b7c5e] hover:text-[#1a3228] disabled:opacity-50"
                                      aria-label="บันทึก"
                                    >
                                      {savingEdit ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={savingEdit}
                                      onClick={cancelEdit}
                                      className="text-[#8a8a8a] hover:text-[#2c2c2c]"
                                      aria-label="ยกเลิก"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => startEdit(friend)}
                                      className="text-[#8a8a8a] transition-colors hover:text-[#6b7c5e]"
                                      aria-label="แก้ไข"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={linkingId === friend.id}
                                      onClick={() => void handleUnlink(friend.id)}
                                      className="text-[#8a8a8a] transition-colors hover:text-red-500"
                                      aria-label="ยกเลิกการผูก"
                                    >
                                      {linkingId === friend.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Link2Off className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-3 md:hidden">
                  {linked.map((friend) => {
                    const isEditing = editingGuestId === friend.guestId;
                    return (
                      <div
                        key={friend.id}
                        className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-4 shadow-[0_2px_16px_rgba(30,58,58,0.04)]"
                      >
                        <div className="flex items-start gap-3">
                          <ProfileAvatar friend={friend} />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-[#1a3228]">
                              {friend.displayName ?? 'ไม่ระบุชื่อ LINE'}
                            </p>
                            <p className="mt-0.5 break-all font-mono text-[0.65rem] text-[#8a8a8a]">
                              {friend.lineUserId}
                            </p>
                          </div>
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => startEdit(friend)}
                              className="text-[#8a8a8a] hover:text-[#6b7c5e]"
                              aria-label="แก้ไข"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="mt-3 space-y-2">
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              maxLength={100}
                              placeholder="ชื่อที่ตั้ง"
                              className="w-full rounded-lg border border-[#e5e9e0] px-2.5 py-2 text-sm outline-none focus:border-[#6b7c5e]"
                              disabled={savingEdit}
                            />
                            <AdminSelect
                              value={editPartySide}
                              onChange={(v) => setEditPartySide(v as PartySide)}
                              options={[
                                { value: 'GROOM', label: 'ฝั่งเจ้าบ่าว' },
                                { value: 'BRIDE', label: 'ฝั่งเจ้าสาว' },
                              ]}
                              placeholder="เลือกฝั่ง"
                            />
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                disabled={savingEdit || !friend.guestId}
                                onClick={() => friend.guestId && void saveEdit(friend.guestId)}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#6b7c5e] px-3 py-1.5 text-xs text-white"
                              >
                                {savingEdit ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                บันทึก
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-lg px-3 py-1.5 text-xs text-[#8a8a8a]"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#eceee9] pt-3">
                            <div>
                              <p className="text-[0.75rem] text-[#8a8a8a]">
                                ชื่อที่ตั้ง:{' '}
                                <span className="text-[#2c2c2c]">{friend.guestName ?? '—'}</span>
                              </p>
                              <p className="mt-1 text-[0.75rem] text-[#8a8a8a]">
                                ฝั่ง:{' '}
                                <span className="text-[#2c2c2c]">
                                  {partySideLabel(friend.guestPartySide)}
                                </span>
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={linkingId === friend.id}
                              onClick={() => void handleUnlink(friend.id)}
                              className="inline-flex items-center gap-1 text-xs text-[#8a8a8a] hover:text-red-500"
                            >
                              {linkingId === friend.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Link2Off className="h-3.5 w-3.5" />
                              )}
                              ยกเลิกผูก
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {unlinked.length > 0 && (
            <section className="space-y-3">
              <div>
                <h3 className="font-medium text-[#1a3228]">ยังไม่ผูกกับแขก</h3>
                <p className="mt-0.5 text-[0.75rem] text-[#8a8a8a]">
                  คนที่เพิ่มเพื่อน OA แล้ว แต่ยังไม่ได้ผูกกับรายชื่อแขก
                </p>
              </div>

              <div className="space-y-3">
                {unlinked.map((friend) => (
                  <div
                    key={friend.id}
                    className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-4 shadow-[0_2px_16px_rgba(30,58,58,0.04)]"
                  >
                    <div className="flex items-start gap-3">
                      <ProfileAvatar friend={friend} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#1a3228]">
                          {friend.displayName ?? 'ไม่ระบุชื่อ LINE'}
                        </p>
                        <p className="mt-0.5 break-all font-mono text-[0.7rem] text-[#8a8a8a]">
                          {friend.lineUserId}
                        </p>
                        <p className="mt-1 text-[0.72rem] text-[#8a8a8a]">
                          เพิ่มเมื่อ {formatThaiDate(friend.followedAt)}
                        </p>

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <AdminSelect
                            value={selectedGuest[friend.id] ?? ''}
                            onChange={(value) =>
                              setSelectedGuest((prev) => ({ ...prev, [friend.id]: value }))
                            }
                            options={unlinkedGuests.map((g) => ({
                              value: g.id,
                              label: g.displayName ?? g.name ?? g.id,
                            }))}
                            placeholder="เลือกแขกที่จะผูก"
                            className="sm:flex-1"
                          />
                          <button
                            type="button"
                            disabled={linkingId === friend.id}
                            onClick={() => void handleLink(friend.id)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#6b7c5e] px-4 py-3 text-sm font-medium text-white hover:bg-[#1a3228] disabled:opacity-50"
                          >
                            {linkingId === friend.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Link2 className="h-4 w-4" />
                            )}
                            ผูกบัญชี
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ProfileAvatar({ friend }: { friend: LineFriend }) {
  if (friend.pictureUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={friend.pictureUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef2ea] text-[#6b7c5e]">
      <MessageCircle className="h-5 w-5" />
    </div>
  );
}
