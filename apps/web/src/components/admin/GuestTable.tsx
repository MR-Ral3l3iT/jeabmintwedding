'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Copy,
  Check,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  UserX,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import {
  getAdminGuests,
  updateAdminGuest,
  deleteAdminGuest,
} from '@/lib/api';
import { getInviteUrl } from '@/lib/constants';
import { formatThaiDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { AddGuestForm } from '@/components/admin/AddGuestForm';
import { AdminFloralDecor } from '@/components/admin/AdminFloralDecor';
import type { Guest } from '@/types';

function getToken(): string {
  const match = document.cookie.match(/admin-token=([^;]+)/);
  return match ? match[1] : '';
}

function guestStatus(g: Guest): { label: string; className: string; icon: typeof Clock } {
  if (!g.rsvpAt) {
    return {
      label: 'รอตอบรับ',
      className: 'bg-[#fdf8ed] text-[#9a7340]',
      icon: Clock,
    };
  }
  if (g.attending) {
    return {
      label: 'เข้าร่วม',
      className: 'bg-[#eef5eb] text-[#3d6b45]',
      icon: CheckCircle2,
    };
  }
  return {
    label: 'ไม่สะดวก',
    className: 'bg-[#fdf0f0] text-[#9a4f4f]',
    icon: UserX,
  };
}

type GuestFilter = 'all' | 'attending' | 'declined' | 'pending';

const FILTER_OPTIONS: {
  value: GuestFilter;
  label: string;
  icon: typeof Users;
}[] = [
  { value: 'all', label: 'ทั้งหมด', icon: Users },
  { value: 'pending', label: 'รอตอบรับ', icon: Clock },
  { value: 'attending', label: 'เข้าร่วม', icon: CheckCircle2 },
  { value: 'declined', label: 'ไม่สะดวก', icon: UserX },
];

const PAGE_SIZE = 10;

function GuestPagination({
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
  if (total === 0) return null;

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

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

function GuestFilterDropdown({
  value,
  onChange,
}: {
  value: GuestFilter;
  onChange: (value: GuestFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = FILTER_OPTIONS.find((o) => o.value === value) ?? FILTER_OPTIONS[0];
  const SelectedIcon = selected.icon;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full sm:w-[11.5rem]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-3.5 py-3 text-sm text-[#2c2c2c] transition-colors hover:border-[#c5cfc5]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          <SelectedIcon className="h-4 w-4 shrink-0 text-[#6b7c5e]" aria-hidden="true" />
          <span className="truncate">{selected.label}</span>
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-[#8a8a8a] transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-[#e5e9e0] bg-white py-1 shadow-[0_8px_28px_rgba(30,58,58,0.12)]"
        >
          {FILTER_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === value;

            return (
              <li key={option.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-[#eef2ea] text-[#1a3228] font-medium'
                      : 'text-[#2c2c2c] hover:bg-[#faf8f4]',
                  )}
                >
                  <Icon
                    className={cn('h-4 w-4', isActive ? 'text-[#6b7c5e]' : 'text-[#8a8a8a]')}
                    aria-hidden="true"
                  />
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function GuestTable() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<GuestFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [actionError, setActionError] = useState('');
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminGuests(getToken(), {
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: filter === 'all' ? undefined : filter,
      });

      setGuests(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, [search, filter, page]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  function resetEditState() {
    setEditingId(null);
    setEditName('');
    setEditError('');
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    resetEditState();
  }

  function handleFilterChange(value: GuestFilter) {
    setFilter(value);
    setPage(1);
    resetEditState();
  }

  function handleGuestCreated() {
    resetEditState();
    if (page !== 1) {
      setPage(1);
    } else {
      fetchGuests();
    }
  }

  function handlePageChange(nextPage: number) {
    resetEditState();
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleCopyLink(guest: Guest) {
    if (!guest.inviteToken) return;
    try {
      await navigator.clipboard.writeText(getInviteUrl(guest.inviteToken));
      setCopiedId(guest.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setActionError('ไม่สามารถคัดลอกลิงก์ได้');
    }
  }

  function startEdit(guest: Guest) {
    setEditingId(guest.id);
    setEditName(guest.displayName ?? guest.name ?? '');
    setActionError('');
    setEditError('');
  }

  async function saveEdit(id: string, name: string) {
    if (savingEdit) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setEditError('กรุณากรอกชื่อบนการ์ด');
      return;
    }

    setEditError('');
    setActionError('');
    setSavingEdit(true);
    try {
      await updateAdminGuest(getToken(), id, trimmed);
      setEditingId(null);
      setEditName('');
      fetchGuests();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'แก้ไขไม่สำเร็จ';
      setEditError(message);
      if (message.includes('เข้าสู่ระบบใหม่')) {
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 1500);
      }
    } finally {
      setSavingEdit(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditError('');
  }

  async function handleDelete(id: string) {
    if (!confirm('ลบรายการเชิญนี้?')) return;
    try {
      await deleteAdminGuest(getToken(), id);
      if (guests.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchGuests();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'ลบไม่สำเร็จ');
    }
  }

  return (
    <div className="space-y-4">
      <AddGuestForm onCreated={handleGuestCreated} />

      <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-4 shadow-[0_4px_24px_rgba(30,58,58,0.05)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8a8a]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ค้นหาจากชื่อ..."
              className="w-full rounded-xl border border-[#e5e9e0] bg-[#faf8f4] py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#6b7c5e]"
            />
          </div>

          <GuestFilterDropdown value={filter} onChange={handleFilterChange} />
        </div>

        <p className="mt-3 text-[0.75rem] text-[#8a8a8a]">ทั้งหมด {total} รายการ</p>
        {actionError && <p className="mt-2 text-xs text-red-500">{actionError}</p>}
      </div>

      {editError && editingId && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">
          {editError}
        </p>
      )}

      {loading && (
        <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white py-16 text-center text-sm text-[#8a8a8a]">
          กำลังโหลด...
        </div>
      )}

      {error && (
        <div className="rounded-[1.25rem] border border-red-100 bg-red-50 py-10 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button
            type="button"
            onClick={fetchGuests}
            className="mt-2 text-sm text-[#6b7c5e] underline"
          >
            ลองใหม่
          </button>
        </div>
      )}

      {!loading && !error && guests.length === 0 && (
        <div className="rounded-[1.25rem] border border-dashed border-[#d5ddd0] bg-white/80 px-4 py-14 text-center">
          <AdminFloralDecor variant="empty" />
          <p className="mt-3 font-serif-cg text-[0.95rem] italic text-[#8a8a8a]">
            {search || filter !== 'all' ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีรายชื่อแขก'}
          </p>
        </div>
      )}

      {!loading && !error && guests.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-[1.25rem] border border-[#e5e9e0] bg-white shadow-[0_4px_24px_rgba(30,58,58,0.05)] md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-[#e5e9e0] bg-[#f7f9f5]">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-medium text-[#1a3228]">ชื่อบนการ์ด</th>
                    <th className="px-5 py-3.5 text-center font-medium text-[#1a3228]">สถานะ</th>
                    <th className="px-5 py-3.5 text-center font-medium text-[#1a3228]">จำนวนคน</th>
                    <th className="px-5 py-3.5 text-left font-medium text-[#1a3228]">ลิงก์เชิญ</th>
                    <th className="px-5 py-3.5 text-right font-medium text-[#1a3228]">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceee9]">
                  {guests.map((g) => (
                    <GuestRow
                      key={g.id}
                      guest={g}
                      copiedId={copiedId}
                      editingId={editingId}
                      editName={editName}
                      onEditName={setEditName}
                      onStartEdit={startEdit}
                      onSaveEdit={saveEdit}
                      onCancelEdit={cancelEdit}
                      onCopyLink={handleCopyLink}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {guests.map((g) => (
              <GuestCard
                key={g.id}
                guest={g}
                copiedId={copiedId}
                editingId={editingId}
                editName={editName}
                onEditName={setEditName}
                onStartEdit={startEdit}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                onCopyLink={handleCopyLink}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <GuestPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

interface GuestRowProps {
  guest: Guest;
  copiedId: string | null;
  editingId: string | null;
  editName: string;
  onEditName: (name: string) => void;
  onStartEdit: (guest: Guest) => void;
  onSaveEdit: (id: string, name: string) => void;
  onCancelEdit: () => void;
  onCopyLink: (guest: Guest) => void;
  onDelete: (id: string) => void;
}

function GuestRow({
  guest: g,
  copiedId,
  editingId,
  editName,
  onEditName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onCopyLink,
  onDelete,
}: GuestRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const status = guestStatus(g);
  const StatusIcon = status.icon;
  const isEditing = editingId === g.id;

  return (
    <tr className="transition-colors hover:bg-[#faf8f4]/60">
      <td className="px-5 py-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => onEditName(e.target.value)}
              onCompositionEnd={(e) => onEditName(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSaveEdit(g.id, e.currentTarget.value);
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  onCancelEdit();
                }
              }}
              className="flex-1 rounded-lg border border-[#e5e9e0] px-2.5 py-1.5 text-sm outline-none focus:border-[#6b7c5e]"
              autoFocus
            />
            <button
              type="button"
              onClick={() => onSaveEdit(g.id, inputRef.current?.value || editName)}
              className="text-[#6b7c5e] hover:text-[#1a3228]"
              aria-label="บันทึก"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-[#8a8a8a] hover:text-[#2c2c2c]"
              aria-label="ยกเลิก"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <GuestNameCell guest={g} />
        )}
      </td>
      <td className="px-5 py-4 text-center">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs',
            status.className,
          )}
        >
          <StatusIcon className="h-3 w-3" aria-hidden="true" />
          {status.label}
        </span>
        {g.rsvpAt && (
          <p className="mt-1 text-[0.65rem] text-[#8a8a8a]">{formatThaiDate(g.rsvpAt)}</p>
        )}
      </td>
      <td className="px-5 py-4 text-center">
        <AttendeeCountCell guest={g} />
      </td>
      <td className="px-5 py-4">
        <CopyLinkButton guest={g} copiedId={copiedId} onCopyLink={onCopyLink} />
      </td>
      <td className="px-5 py-4 text-right">
        <ActionButtons guest={g} onStartEdit={onStartEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
}

function GuestCard({
  guest: g,
  copiedId,
  editingId,
  editName,
  onEditName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onCopyLink,
  onDelete,
}: GuestRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const status = guestStatus(g);
  const StatusIcon = status.icon;
  const isEditing = editingId === g.id;

  return (
    <div className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-4 shadow-[0_2px_16px_rgba(30,58,58,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={editName}
                onChange={(e) => onEditName(e.target.value)}
                onCompositionEnd={(e) => onEditName(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSaveEdit(g.id, e.currentTarget.value);
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    onCancelEdit();
                  }
                }}
                className="flex-1 rounded-lg border border-[#e5e9e0] px-2.5 py-1.5 text-sm outline-none focus:border-[#6b7c5e]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => onSaveEdit(g.id, inputRef.current?.value || editName)}
                aria-label="บันทึก"
              >
                <Check className="h-4 w-4 text-[#6b7c5e]" />
              </button>
              <button type="button" onClick={onCancelEdit} aria-label="ยกเลิก">
                <X className="h-4 w-4 text-[#8a8a8a]" />
              </button>
            </div>
          ) : (
            <GuestNameCell guest={g} />
          )}
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[0.65rem]',
            status.className,
          )}
        >
          <StatusIcon className="h-3 w-3" aria-hidden="true" />
          {status.label}
        </span>
      </div>

      {g.rsvpAt && (
        <p className="mt-2 text-[0.7rem] text-[#8a8a8a]">{formatThaiDate(g.rsvpAt)}</p>
      )}

      <p className="mt-2 text-[0.75rem] text-[#8a8a8a]">
        จำนวนคน: <AttendeeCountCell guest={g} inline />
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-[#eceee9] pt-3">
        <CopyLinkButton guest={g} copiedId={copiedId} onCopyLink={onCopyLink} />
        <ActionButtons guest={g} onStartEdit={onStartEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}

function AttendeeCountCell({ guest: g, inline = false }: { guest: Guest; inline?: boolean }) {
  const content =
    g.attending && g.attendeeCount != null ? (
      <span className="font-medium text-[#3d6b45]">{g.attendeeCount} คน</span>
    ) : (
      <span className="text-[#8a8a8a]">—</span>
    );

  if (inline) return content;

  return <div className="text-sm">{content}</div>;
}

function GuestNameCell({ guest: g }: { guest: Guest }) {
  return (
    <>
      <span className="font-medium text-[#2c2c2c]">{g.displayName ?? g.name ?? '—'}</span>
      {g.rsvpAt && g.name && g.name !== g.displayName && (
        <p className="mt-0.5 text-xs text-[#8a8a8a]">ตอบรับในนาม: {g.name}</p>
      )}
      {g.wishMessage && (
        <p className="mt-0.5 max-w-[240px] truncate text-xs italic text-[#8a8a8a]">
          &ldquo;{g.wishMessage}&rdquo;
        </p>
      )}
    </>
  );
}

function CopyLinkButton({
  guest: g,
  copiedId,
  onCopyLink,
}: {
  guest: Guest;
  copiedId: string | null;
  onCopyLink: (guest: Guest) => void;
}) {
  if (!g.inviteToken) {
    return <span className="text-xs text-[#8a8a8a]">—</span>;
  }

  return (
    <button
      type="button"
      onClick={() => onCopyLink(g)}
      className="inline-flex items-center gap-1.5 text-xs text-[#6b7c5e] transition-colors hover:text-[#1a3228]"
    >
      {copiedId === g.id ? (
        <>
          <Check className="h-3.5 w-3.5" />
          คัดลอกแล้ว
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          คัดลอกลิงก์
        </>
      )}
    </button>
  );
}

function ActionButtons({
  guest: g,
  onStartEdit,
  onDelete,
}: {
  guest: Guest;
  onStartEdit: (guest: Guest) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => onStartEdit(g)}
        className="text-[#8a8a8a] transition-colors hover:text-[#6b7c5e]"
        aria-label="แก้ไขชื่อ"
      >
        <Pencil className="h-4 w-4" />
      </button>
      {!g.rsvpAt && (
        <button
          type="button"
          onClick={() => onDelete(g.id)}
          className="text-[#8a8a8a] transition-colors hover:text-red-500"
          aria-label="ลบ"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
