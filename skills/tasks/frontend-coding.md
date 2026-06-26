---
name: frontend-coding
description: Task Skill สำหรับการเขียนโค้ด Frontend ใช้ทุกครั้งที่ต้องสร้าง Next.js Page, React Component, Custom Hook, API Integration, Form Handling, หรือ State Management ด้วย TypeScript + TailwindCSS + Lucide Icons ใช้ skill นี้เมื่อผู้ใช้ขอ code frontend, สร้าง component, เขียน page, จัดการ form, เชื่อมต่อ API, หรือจัดการ state ฝั่ง client
---

# Task: Frontend Coding

งานนี้ใช้ร่วมกับ Role: **Frontend Developer**
อ้างอิง: `/standards/coding-standard.md`, `/standards/naming-convention.md`

---

## ขั้นตอนการทำงาน

```
Step 1: รับ Design Spec + API Contract
        ↓
Step 2: สร้าง Type Definitions
        ↓
Step 3: สร้าง API Functions
        ↓
Step 4: สร้าง Custom Hook
        ↓
Step 5: สร้าง UI Component
        ↓
Step 6: เชื่อม Component + Hook
        ↓
Step 7: จัดการ Loading / Error / Empty States
        ↓
Step 8: ตรวจสอบ Responsive + Accessibility
```

---

## Step 1: Type Definitions ก่อนเสมอ

```typescript
// types/[feature].types.ts
// สร้างก่อนเขียน component ทุกครั้ง

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// Payloads (สำหรับส่ง API)
export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

// API Response wrappers
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## Step 2: API Function Pattern

```typescript
// lib/api/[feature].api.ts
import { apiClient } from './client';
import type { User, CreateUserPayload, UpdateUserPayload } from '@/types/user.types';
import type { PaginatedResponse } from '@/types/api.types';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export const usersApi = {
  getAll: async (params: GetUsersParams): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get('/users', { params });
    return data.data; // unwrap standard response wrapper
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data.data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await apiClient.post('/users', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await apiClient.patch(`/users/${id}`, payload);
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
```

---

## Step 3: Custom Hook Pattern

### useQuery Hook (ดึงข้อมูล)
```typescript
// hooks/use-users.ts
import { useState, useEffect, useCallback } from 'react';
import { usersApi, type GetUsersParams } from '@/lib/api/users.api';
import type { User } from '@/types/user.types';
import type { PaginatedResponse } from '@/types/api.types';

interface UseUsersState {
  data: PaginatedResponse<User> | null;
  isLoading: boolean;
  error: string | null;
}

export function useUsers(params: GetUsersParams) {
  const [state, setState] = useState<UseUsersState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await usersApi.getAll(params);
      setState({ data: result, isLoading: false, error: null });
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่',
      }));
    }
  }, [params.page, params.limit, params.search, params.role]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    users: state.data?.data ?? [],
    total: state.data?.total ?? 0,
    totalPages: state.data?.totalPages ?? 0,
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetch,
  };
}
```

### useMutation Hook (สร้าง/แก้ไข/ลบ)
```typescript
// hooks/use-create-user.ts
import { useState } from 'react';
import { usersApi } from '@/lib/api/users.api';
import type { CreateUserPayload, User } from '@/types/user.types';

interface UseMutationState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useCreateUser() {
  const [state, setState] = useState<UseMutationState<User>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = async (payload: CreateUserPayload): Promise<User | null> => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const result = await usersApi.create(payload);
      setState({ data: result, isLoading: false, error: null });
      return result;
    } catch (err: unknown) {
      const message = extractApiError(err) ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  };

  return { ...state, execute };
}

// Helper: ดึง error message จาก Axios error
function extractApiError(err: unknown): string | null {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string | string[] } } }).response;
    const msg = response?.data?.message;
    if (Array.isArray(msg)) return msg[0];
    if (typeof msg === 'string') return msg;
  }
  return null;
}
```

---

## Step 4: Component Pattern

### Server Component (ดึงข้อมูลฝั่ง Server)
```tsx
// app/(dashboard)/users/page.tsx
// ไม่ใส่ 'use client' — ทำงานบน server

import { UserTable } from '@/components/features/users/user-table';

interface UsersPageProps {
  searchParams: { page?: string; search?: string; role?: string };
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const page = Number(searchParams.page) || 1;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">ผู้ใช้งาน</h1>
          <p className="mt-1 text-sm text-gray-500">จัดการผู้ใช้งานในระบบ</p>
        </div>
      </div>
      <UserTable initialPage={page} />
    </div>
  );
}
```

### Client Component (มี state/interaction)
```tsx
// components/features/users/user-table.tsx
'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useUsers } from '@/hooks/use-users';
import { UserRow } from './user-row';
import { UserFormModal } from './user-form-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';

interface UserTableProps {
  initialPage?: number;
}

export function UserTable({ initialPage = 1 }: UserTableProps) {
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { users, total, totalPages, isLoading, error, refetch } = useUsers({
    page,
    limit: 20,
    search: search || undefined,
  });

  if (isLoading) return <TableSkeleton rows={5} />;

  if (error) return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
      <p className="text-sm text-red-600">{error}</p>
      <button onClick={refetch} className="mt-2 text-sm text-red-700 underline">ลองใหม่</button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          เพิ่มผู้ใช้
        </button>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <EmptyState
          title="ยังไม่มีผู้ใช้งาน"
          description="กดปุ่ม 'เพิ่มผู้ใช้' เพื่อเริ่มต้น"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ชื่อ / อีเมล</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">สถานะ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onDelete={(id) => setDeleteTarget(id)}
                  onUpdate={refetch}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          total={total}
          limit={20}
          onPageChange={setPage}
        />
      )}

      {/* Modals */}
      <UserFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => { setIsCreateOpen(false); refetch(); }}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="ยืนยันการลบ"
        message="คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?"
        onConfirm={async () => {
          if (deleteTarget) {
            await usersApi.remove(deleteTarget);
            setDeleteTarget(null);
            refetch();
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
```

---

## Step 5: Form Pattern

```tsx
// components/features/users/user-form-modal.tsx
'use client';

import { useState } from 'react';
import { useCreateUser } from '@/hooks/use-create-user';
import type { CreateUserPayload } from '@/types/user.types';
import { UserRole } from '@/types/user.types';
import { cn } from '@/lib/utils/cn';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const initialForm: CreateUserPayload = {
  name: '',
  email: '',
  password: '',
  role: UserRole.USER,
};

type FormErrors = Partial<Record<keyof CreateUserPayload, string>>;

export function UserFormModal({ isOpen, onClose, onSuccess }: UserFormModalProps) {
  const [form, setForm] = useState<CreateUserPayload>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const { execute, isLoading, error: apiError } = useCreateUser();

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'กรุณากรอกชื่อ';
    if (!form.email.trim()) newErrors.email = 'กรุณากรอกอีเมล';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!form.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
    else if (form.password.length < 8)
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const result = await execute(form);
    if (result) {
      setForm(initialForm);
      setErrors({});
      onSuccess();
    }
  }

  function handleClose() {
    setForm(initialForm);
    setErrors({});
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">เพิ่มผู้ใช้ใหม่</h2>
          <button onClick={handleClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-4">
          {apiError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{apiError}</div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              className={cn(
                'mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.name ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">อีเมล *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              className={cn(
                'mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.email ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสผ่าน *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              className={cn(
                'mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.password ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Checklist ก่อนส่ง QA

- [ ] TypeScript ไม่มี error, ไม่มี `any`
- [ ] ทุก component มี loading, error, empty state
- [ ] Form มี client-side validation ครบ
- [ ] API error message แสดงให้ user เห็น
- [ ] ปุ่ม Submit disabled ระหว่าง loading
- [ ] Responsive ทดสอบ mobile/tablet/desktop
- [ ] Lucide icons ใส่ `aria-hidden="true"` ครบ
- [ ] ไม่มี `console.log` หลงเหลือ
- [ ] Build ผ่าน `npm run build`
