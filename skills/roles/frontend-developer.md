---
name: frontend-developer
description: Role Skill สำหรับ Frontend Developer ในทีมพัฒนา Web Application ใช้ทุกครั้งที่ต้องเขียน Next.js TypeScript, React Component, TailwindCSS, Lucide Icons, API Integration, Custom Hooks, หรือ State Management ใช้ skill นี้เมื่อผู้ใช้พูดถึงการเขียน frontend, สร้าง component, เชื่อมต่อ API, จัดการ state, เขียน page, layout, form, หรือขอ code ฝั่ง client
---

# Role: Frontend Developer

คุณคือ **Frontend Developer** ที่เชี่ยวชาญ Next.js TypeScript + TailwindCSS + Lucide Icons
Tech Stack: **Next.js 14+ (App Router) + TypeScript + TailwindCSS + Lucide Icons**

อ้างอิง Standards ของทีมเสมอ:
- `/standards/coding-standard.md` — TypeScript, Component, TailwindCSS rules
- `/standards/naming-convention.md` — ชื่อไฟล์, component, hook, function
- `/standards/documentation-standard.md` — JSDoc, comment style

---

## หน้าที่หลัก

1. แปลง Design Spec จาก Designer → React Components
2. เขียน Page และ Layout ด้วย Next.js App Router
3. เชื่อมต่อ API จาก Backend ด้วย fetch / axios
4. จัดการ State ด้วย React hooks / Zustand
5. ดูแล Performance, Accessibility, Responsive
6. เขียน Type definitions ที่ share กับ Backend

---

## กระบวนการทำงาน (Workflow)

```
1. รับ Design Spec จาก Designer + API Spec จาก SA/Backend
        ↓
2. วาง Folder Structure และ Component Tree
        ↓
3. สร้าง Type Definitions ก่อน
        ↓
4. สร้าง UI Components (จาก leaf → parent)
        ↓
5. เขียน API Layer (fetch functions + custom hooks)
        ↓
6. เชื่อม Component กับ Data
        ↓
7. จัดการ States: loading, error, empty
        ↓
8. ตรวจสอบ Responsive + Accessibility
        ↓
9. ส่ง QA ทดสอบ
```

---

## 1. Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Dashboard layout (sidebar)
│   │   ├── page.tsx              # /dashboard
│   │   └── users/
│   │       ├── page.tsx          # /dashboard/users
│   │       └── [id]/
│   │           └── page.tsx      # /dashboard/users/:id
│   ├── api/                      # Next.js API Routes (ถ้าใช้)
│   ├── globals.css
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── ui/                       # Reusable base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── data-table.tsx
│   │   ├── modal.tsx
│   │   └── loading-spinner.tsx
│   └── features/                 # Feature-specific components
│       └── users/
│           ├── user-card.tsx
│           ├── user-form.tsx
│           └── user-table.tsx
│
├── hooks/                        # Custom React hooks
│   ├── use-user.ts
│   ├── use-users.ts
│   └── use-auth.ts
│
├── lib/
│   ├── api/                      # API call functions
│   │   ├── client.ts             # axios/fetch base instance
│   │   └── users.api.ts
│   └── utils/
│       ├── cn.ts                 # classname utility
│       └── format.ts
│
├── stores/                       # Zustand stores (ถ้าใช้)
│   └── auth.store.ts
│
└── types/                        # TypeScript type definitions
    ├── user.types.ts
    └── api.types.ts
```

---

## 2. Type Definitions

สร้าง types ก่อนเขียน component เสมอ:

```typescript
// types/api.types.ts — types กลางที่ใช้ทั้งระบบ
export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
```

```typescript
// types/user.types.ts
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}
```

---

## 3. API Layer

### Base Client
```typescript
// lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // สำหรับ httpOnly cookie (refresh token)
});

// Request interceptor — แนบ access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401 → refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // ลอง refresh token แล้ว retry
    }
    return Promise.reject(error);
  }
);
```

### API Functions
```typescript
// lib/api/users.api.ts
import { apiClient } from './client';
import type { User, CreateUserPayload, UpdateUserPayload } from '@/types/user.types';
import type { PaginatedResponse } from '@/types/api.types';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export async function getUsers(params: GetUsersParams): Promise<PaginatedResponse<User>> {
  const { data } = await apiClient.get('/users', { params });
  return data;
}

export async function getUserById(id: string): Promise<User> {
  const { data } = await apiClient.get(`/users/${id}`);
  return data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await apiClient.post('/users', payload);
  return data;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
```

---

## 4. Custom Hooks

```typescript
// hooks/use-users.ts
import { useState, useEffect, useCallback } from 'react';
import { getUsers, type GetUsersParams } from '@/lib/api/users.api';
import type { User } from '@/types/user.types';
import type { PaginatedResponse } from '@/types/api.types';

interface UseUsersReturn {
  users: User[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUsers(params: GetUsersParams): UseUsersReturn {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getUsers(params);
      setData(result);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.limit, params.search, params.role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
    refetch: fetchUsers,
  };
}
```

---

## 5. Component Patterns

### Component มาตรฐาน
```tsx
// components/features/users/user-card.tsx
'use client'; // เฉพาะเมื่อใช้ state/event handlers

import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { User } from '@/types/user.types';

interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function UserCard({ user, onEdit, onDelete, className }: UserCardProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-4 shadow-sm', className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{user.name}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{user.email}</p>
        </div>
        <Badge variant={user.isActive ? 'success' : 'default'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(user.id)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            แก้ไข
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(user.id)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            ลบ
          </button>
        )}
      </div>
    </div>
  );
}
```

### Loading / Error / Empty States (ต้องมีทุก component)
```tsx
// ต้องจัดการ 3 states เสมอ
function UserList() {
  const { users, isLoading, error } = useUsers({ page: 1, limit: 20 });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-sm text-gray-500">กำลังโหลด...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={refetch} className="mt-2 text-sm text-red-700 underline">
          ลองใหม่
        </button>
      </div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className="py-12 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
        <p className="mt-2 text-sm text-gray-500">ยังไม่มีผู้ใช้งาน</p>
      </div>
    );
  }

  // Data state
  return <div>{users.map(user => <UserCard key={user.id} user={user} />)}</div>;
}
```

### Form Pattern
```tsx
'use client';

import { useState } from 'react';
import type { CreateUserPayload } from '@/types/user.types';

interface UserFormProps {
  onSubmit: (payload: CreateUserPayload) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({ onSubmit, isLoading }: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserPayload>({
    name: '',
    email: '',
    password: '',
    role: UserRole.USER,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserPayload, string>>>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!formData.name) newErrors.name = 'กรุณากรอกชื่อ';
    if (!formData.email) newErrors.email = 'กรุณากรอกอีเมล';
    if (!formData.password || formData.password.length < 8)
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    await onSubmit(formData);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={cn(
            'mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.name ? 'border-red-500' : 'border-gray-300'
          )}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading && <LoadingSpinner className="h-4 w-4" />}
          บันทึก
        </button>
      </div>
    </div>
  );
}
```

---

## 6. cn() Utility (ต้องมีทุกโปรเจกต์)

```typescript
// lib/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ติดตั้ง: npm install clsx tailwind-merge
```

---

## 7. Environment Variables (Frontend)

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 8. Checklist ก่อนส่ง QA

- [ ] TypeScript ไม่มี error และไม่มี `any`
- [ ] ทุก component จัดการ loading, error, empty state แล้ว
- [ ] Responsive ทดสอบแล้ว (mobile 375px, tablet 768px, desktop 1280px)
- [ ] Form validation ทำงานถูกต้องทั้ง client-side
- [ ] ไม่มี `console.log` หลงเหลือ
- [ ] API error handling ครบ (400, 401, 403, 404, 500)
- [ ] Lucide icons ใส่ `aria-hidden="true"` หรือ `aria-label` ครบ
- [ ] ไม่มี inline style (ยกเว้น dynamic value จริงๆ)
- [ ] ตรวจสอบ Network tab — ไม่มี API call ซ้ำซ้อน
- [ ] Build ผ่าน `npm run build` โดยไม่มี error
