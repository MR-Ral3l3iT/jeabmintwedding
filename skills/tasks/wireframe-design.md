---
name: wireframe-design
description: Task Skill สำหรับการออกแบบ Wireframe และ UI Layout ใช้ทุกครั้งที่ต้องวาด Wireframe, ออกแบบ Layout หน้าจอ, กำหนด Component Structure, หรือสร้าง User Flow Diagram สำหรับ Web Application ที่ใช้ Next.js + TailwindCSS ใช้ skill นี้เมื่อผู้ใช้พูดถึงการออกแบบหน้าจอ, วาด wireframe, layout design, user flow, หรือขอดู structure ของหน้าต่างๆ
---

# Task: Wireframe Design

งานนี้ใช้ร่วมกับ Role: **UX/UI Designer**
อ้างอิง: `/standards/coding-standard.md` (TailwindCSS section)

---

## ขั้นตอนการทำงาน

```
Step 1: รับ User Stories จาก SA
        ↓
Step 2: สร้าง Page Inventory (รายการหน้าทั้งหมด)
        ↓
Step 3: วาด User Flow (หน้าเชื่อมกันอย่างไร)
        ↓
Step 4: วาด Wireframe ทีละหน้า
        ↓
Step 5: กำหนด Component Structure
        ↓
Step 6: เขียน Design Notes ส่งต่อ Frontend
```

---

## Step 1: Page Inventory Template

สร้างรายการหน้าทั้งหมดก่อนเริ่มวาด:

```markdown
## Page Inventory

| Page | Route | Auth Required | Role | User Story |
|------|-------|--------------|------|-----------|
| Login | /login | No | All | US-002 |
| Register | /register | No | All | US-001 |
| Dashboard | /dashboard | Yes | All | US-010 |
| User List | /dashboard/users | Yes | Admin | US-020 |
| User Detail | /dashboard/users/[id] | Yes | Admin | US-021 |
| My Profile | /dashboard/profile | Yes | All | US-015 |
| Settings | /dashboard/settings | Yes | Admin | US-030 |
| 404 | /not-found | No | All | - |
```

---

## Step 2: User Flow (Text Format)

```markdown
## User Flow: ระบบ Authentication

[Guest] → /login
  ├── Login สำเร็จ
  │     ├── Role = ADMIN → /dashboard/users
  │     └── Role = USER  → /dashboard
  ├── ลืมรหัสผ่าน → /forgot-password
  │     └── กรอก email → ส่ง email → /reset-password?token=xxx
  │           └── ตั้งรหัสผ่านใหม่ → /login
  └── ยังไม่มีบัญชี → /register
        └── สมัครสำเร็จ → /verify-email (pending)
              └── คลิก link ใน email → /login

## User Flow: User Management (Admin)

/dashboard/users (User List)
  ├── คลิก "+ Add User" → Modal: Create User Form
  │     ├── Submit สำเร็จ → ปิด Modal, refresh list, toast success
  │     └── Submit ผิด → แสดง validation error ใน Modal
  ├── คลิก "Edit" → Modal: Edit User Form
  │     ├── Save สำเร็จ → ปิด Modal, refresh list
  │     └── Cancel → ปิด Modal
  └── คลิก "Delete" → Confirm Dialog
        ├── Confirm → soft delete, refresh list, toast success
        └── Cancel → ปิด Dialog
```

---

## Step 3: Wireframe Patterns

### 3.1 Auth Pages

```
## Wireframe: Login Page (/login)

┌─────────────────────────────────┐
│                                 │
│         [Logo / App Name]       │  ← text-3xl font-bold text-center
│                                 │
│  ┌─────────────────────────┐    │
│  │      เข้าสู่ระบบ        │    │  ← Card: bg-white rounded-xl shadow p-8
│  │                         │    │     max-w-md mx-auto
│  │  อีเมล                  │    │
│  │  [____________________] │    │  ← Input full width
│  │                         │    │
│  │  รหัสผ่าน               │    │
│  │  [____________________] │    │
│  │  [👁 แสดง/ซ่อน]         │    │  ← toggle password visibility
│  │                         │    │
│  │  [  เข้าสู่ระบบ  ]      │    │  ← Button primary, full width
│  │                         │    │
│  │  ลืมรหัสผ่าน?           │    │  ← text-sm text-blue-600
│  │                         │    │
│  │  ─────────── หรือ ───── │    │
│  │                         │    │
│  │  ยังไม่มีบัญชี?          │    │
│  │  [สมัครสมาชิก]          │    │  ← Link to /register
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
Mobile: เต็มหน้าจอ, padding 16px
Desktop: centered card, max-w-md
```

### 3.2 Dashboard Layout

```
## Wireframe: Dashboard Layout

┌──────────────────────────────────────────────────┐
│ SIDEBAR (w-64, fixed)    │ MAIN CONTENT (flex-1) │
│                          │                        │
│ [Logo]                   │ TOPBAR                 │
│                          │ ┌────────────────────┐ │
│ Navigation               │ │ Page Title    [👤] │ │
│ ──────────────           │ └────────────────────┘ │
│ 🏠 Dashboard             │                        │
│ 👥 ผู้ใช้งาน    ← active │ CONTENT AREA           │
│ 📦 สินค้า                │ ┌────────────────────┐ │
│ 📋 คำสั่งซื้อ            │ │                    │ │
│ ⚙️  ตั้งค่า              │ │   Page Content     │ │
│                          │ │                    │ │
│ ──────────────           │ └────────────────────┘ │
│ [Avatar] ชื่อ User       │                        │
│ [ออกจากระบบ]             │                        │
└──────────────────────────────────────────────────┘

Mobile: Sidebar ซ่อน → Hamburger menu → Slide-in drawer
Tablet: Sidebar icon-only (w-16) หรือ overlay
Desktop: Sidebar แสดงเต็ม (w-64)
```

### 3.3 List Page with Table

```
## Wireframe: User List (/dashboard/users)

┌─────────────────────────────────────────────────┐
│ ผู้ใช้งาน                          [+ เพิ่มผู้ใช้] │  ← Page header
│ จัดการผู้ใช้งานในระบบ                             │
├─────────────────────────────────────────────────┤
│ 🔍 [ค้นหาชื่อหรืออีเมล...]  [Role ▼] [สถานะ ▼]  │  ← Filter bar
├──────┬───────────────────┬──────────┬──────┬────┤
│  ☐   │ ชื่อ / อีเมล      │ Role     │ สถานะ│    │  ← Table header
├──────┼───────────────────┼──────────┼──────┼────┤
│  ☐   │ สมชาย ใจดี        │ 🔵 Admin │  ✅  │ ⋮  │  ← Row + action menu
│      │ s@mail.com        │          │      │    │
├──────┼───────────────────┼──────────┼──────┼────┤
│  ☐   │ สมหญิง ดีใจ      │ ⚪ User  │  ✅  │ ⋮  │
│      │ h@mail.com        │          │      │    │
├──────┴───────────────────┴──────────┴──────┴────┤
│ แสดง 1-20 จาก 48 รายการ    [<][1][2][3][>]      │  ← Pagination
└─────────────────────────────────────────────────┘

Mobile: ซ่อน column บางส่วน, แสดงแค่ชื่อ + actions
Action menu (⋮): Edit | View | Deactivate | Delete
```

### 3.4 Modal / Dialog

```
## Wireframe: Create/Edit User Modal

┌─────────────────────────────────────┐
│ ░░░░░░ Backdrop (bg-black/50) ░░░░░ │
│  ┌───────────────────────────────┐  │
│  │ เพิ่มผู้ใช้ใหม่            [✕] │  │  ← Modal header
│  ├───────────────────────────────┤  │
│  │                               │  │
│  │ ชื่อ-นามสกุล *               │  │
│  │ [_____________________________] │  │
│  │                               │  │
│  │ อีเมล *                       │  │
│  │ [_____________________________] │  │
│  │                               │  │
│  │ รหัสผ่าน *                    │  │
│  │ [_____________________________] │  │
│  │                               │  │
│  │ Role                          │  │
│  │ [User              ▼]         │  │
│  │                               │  │
│  ├───────────────────────────────┤  │
│  │ [   ยกเลิก   ]  [  บันทึก  ] │  │  ← Modal footer
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

Width: max-w-lg
Mobile: full-screen bottom sheet
```

### 3.5 Confirm Dialog

```
## Wireframe: Confirm Delete Dialog

┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐  │
│  │       ⚠️  ยืนยันการลบ         │  │
│  ├───────────────────────────────┤  │
│  │                               │  │
│  │  คุณต้องการลบผู้ใช้           │  │
│  │  "สมชาย ใจดี" ใช่หรือไม่?    │  │
│  │                               │  │
│  │  การลบนี้ไม่สามารถ           │  │
│  │  ย้อนกลับได้                  │  │
│  │                               │  │
│  ├───────────────────────────────┤  │
│  │  [   ยกเลิก   ]  [  ลบ 🗑  ] │  │  ← Delete button: bg-red-600
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
Width: max-w-sm (เล็กกว่า form modal)
```

### 3.6 Empty & Loading States

```
## Empty State

┌─────────────────────────────────────┐
│                                     │
│           [Icon ขนาดใหญ่]           │  ← h-16 w-16 text-gray-300
│                                     │
│        ยังไม่มีข้อมูลผู้ใช้          │  ← text-gray-500
│   กดปุ่ม "เพิ่มผู้ใช้" เพื่อเริ่มต้น  │  ← text-sm text-gray-400
│                                     │
│        [+ เพิ่มผู้ใช้แรก]           │  ← Button (optional)
│                                     │
└─────────────────────────────────────┘

## Loading State (Skeleton)

┌─────────────────────────────────────┐
│ [████████████]  [████] [████████]   │  ← animate-pulse bg-gray-200
│ [██████████████████████████████]    │
│ [████████]  [█████████████████]     │
└─────────────────────────────────────┘
```

---

## Step 4: Component Structure

จากทุก Wireframe สรุป Components ที่ต้องสร้าง:

```markdown
## Component Inventory

### UI Components (Reusable)
| Component | Props หลัก | ใช้ใน |
|-----------|-----------|-------|
| Button | variant, size, loading, disabled | ทุกหน้า |
| Input | label, error, type | ทุก form |
| Modal | isOpen, onClose, title | Create/Edit forms |
| ConfirmDialog | isOpen, title, message, onConfirm | ทุก delete action |
| Badge | variant (success/warning/error) | status fields |
| DataTable | columns, data, loading, pagination | list pages |
| Pagination | total, page, limit, onChange | list pages |
| Skeleton | rows, cols | loading states |
| EmptyState | icon, title, description, action | list pages |

### Feature Components
| Component | Feature | Route |
|-----------|---------|-------|
| LoginForm | Auth | /login |
| RegisterForm | Auth | /register |
| DashboardSidebar | Layout | (dashboard) |
| UserTable | Users | /dashboard/users |
| UserForm | Users | Modal |
```

---

## Checklist ก่อนส่งต่อ Frontend

- [ ] Page Inventory ครบทุกหน้า
- [ ] User Flow ครอบคลุมทุก path (happy + error)
- [ ] Wireframe ทุกหน้ามี mobile และ desktop version
- [ ] Modal และ Dialog ทุกตัวออกแบบแล้ว
- [ ] Empty state และ Loading state ทุก list page
- [ ] Component Inventory พร้อมแล้ว
- [ ] TailwindCSS classes หลักระบุไว้ใน wireframe notes
