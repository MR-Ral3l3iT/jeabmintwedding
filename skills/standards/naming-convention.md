---
name: naming-convention
description: มาตรฐานการตั้งชื่อสำหรับทีมพัฒนา Web Application ที่ใช้ NestJS + Next.js TypeScript + PostgreSQL + Prisma ใช้ทุกครั้งที่ตั้งชื่อไฟล์ โฟลเดอร์ ตัวแปร ฟังก์ชัน component API endpoint หรือ database table ในโปรเจกต์นี้
---

# Naming Convention
มาตรฐานการตั้งชื่อสำหรับ Web Application Stack: NestJS + Next.js (TypeScript) + PostgreSQL + Prisma

---

## 1. หลักการทั่วไป

| รูปแบบ | ชื่อเรียก | ตัวอย่าง |
|--------|-----------|----------|
| `camelCase` | ตัวแปร, function, method | `getUserById`, `isActive` |
| `PascalCase` | Class, Interface, Type, Component, Enum | `UserService`, `CreateUserDto` |
| `SCREAMING_SNAKE_CASE` | Constant, Enum value | `MAX_RETRY_COUNT`, `USER_ROLE` |
| `kebab-case` | ชื่อไฟล์, โฟลเดอร์, URL | `user-profile.tsx`, `/api/user-profile` |
| `snake_case` | ชื่อ Table, Column ใน Database | `users`, `created_at` |

---

## 2. TypeScript / JavaScript

### ตัวแปร (Variables)
```typescript
// ✅ ถูกต้อง
const userId = 'abc123';
const isEmailVerified = true;
const userList: User[] = [];
const MAX_LOGIN_ATTEMPTS = 5;

// ❌ ผิด
const user_id = 'abc123';       // ห้ามใช้ snake_case
const UserID = 'abc123';        // ห้ามใช้ PascalCase กับตัวแปร
const x = 'abc123';             // ห้ามตั้งชื่อย่อไม่มีความหมาย
```

### Functions / Methods
- ขึ้นต้นด้วย **verb** เสมอ
- ชื่อต้องสื่อความหมายชัดเจนว่า "ทำอะไร"

```typescript
// ✅ ถูกต้อง
async getUserById(id: string): Promise<User> { ... }
async createOrder(dto: CreateOrderDto): Promise<Order> { ... }
function formatCurrency(amount: number): string { ... }
function isValidEmail(email: string): boolean { ... }
function hasPermission(user: User, action: string): boolean { ... }

// ❌ ผิด
async user(id: string) { ... }       // ไม่มี verb
async getData() { ... }               // คลุมเครือเกินไป
function check(email: string) { ... } // ไม่บอกว่า check อะไร
```

### Interface & Type
```typescript
// Interface → ชื่อ entity หรือ object shape (ไม่ต้องมี I นำหน้า)
interface User { ... }
interface CreateUserDto { ... }
interface UserResponseDto { ... }
interface PaginatedResult<T> { ... }

// Type → union, intersection, utility types
type UserRole = 'ADMIN' | 'USER' | 'MODERATOR';
type UserWithPosts = User & { posts: Post[] };
type PartialUser = Partial<User>;
```

### Enum
```typescript
// ✅ ถูกต้อง
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
}

enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}
```

---

## 3. ไฟล์และโฟลเดอร์

### รูปแบบ: `[name].[type].[ext]`

```
// Backend (NestJS)
users.module.ts
users.controller.ts
users.service.ts
users.repository.ts
create-user.dto.ts
update-user.dto.ts
user-response.dto.ts
user.entity.ts
jwt-auth.guard.ts
transform.interceptor.ts

// Frontend (Next.js)
user-card.tsx           // component
use-user.ts             // custom hook (ขึ้นต้นด้วย use-)
user.types.ts           // type definitions
user.api.ts             // API call functions
format-date.ts          // utility function
```

### โฟลเดอร์
```
// ✅ ถูกต้อง — kebab-case
user-profile/
order-management/
auth-callback/

// ❌ ผิด
UserProfile/
orderManagement/
auth_callback/
```

### Next.js App Router (Pages & Layouts)
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx
│   └── users/
│       ├── page.tsx          // /dashboard/users
│       └── [id]/
│           └── page.tsx      // /dashboard/users/[id]
└── api/
    └── users/
        └── route.ts
```

---

## 4. Backend — NestJS

### Class Naming
```typescript
// Module
UsersModule, AuthModule, OrdersModule

// Controller
UsersController, AuthController

// Service
UsersService, AuthService, EmailService

// Guard
JwtAuthGuard, RolesGuard, ApiKeyGuard

// Interceptor
TransformInterceptor, LoggingInterceptor

// Pipe
ParseUuidPipe, ValidationPipe

// Filter
HttpExceptionFilter, AllExceptionsFilter

// Decorator
GetUser (custom decorator)
```

### DTO Naming
```typescript
// Pattern: [Action][Entity]Dto
CreateUserDto       // สร้าง
UpdateUserDto       // แก้ไข
DeleteUserDto       // ลบ (ถ้าจำเป็น)
UserResponseDto     // response กลับไปให้ client
UserListResponseDto // response แบบ list
LoginDto            // สำหรับ auth
ChangePasswordDto
```

### API Endpoint (URL)
- ใช้ **kebab-case** และ **lowercase** เสมอ
- ใช้ noun (ไม่ใช่ verb) สำหรับ resource
- ใช้ HTTP method แสดง action

```
// ✅ ถูกต้อง
GET    /api/users               → ดึงรายการ users
POST   /api/users               → สร้าง user
GET    /api/users/:id           → ดึง user ตาม id
PATCH  /api/users/:id           → แก้ไข user
DELETE /api/users/:id           → ลบ user
GET    /api/users/:id/orders    → orders ของ user นั้น
POST   /api/auth/login          → login
POST   /api/auth/refresh-token  → refresh token

// ❌ ผิด
GET  /api/getUsers              // มี verb ใน URL
POST /api/createUser            // มี verb ใน URL
GET  /api/Users                 // Uppercase
```

---

## 5. Frontend — React Components

### Component
```tsx
// ✅ ถูกต้อง — PascalCase
UserCard.tsx
UserProfileForm.tsx
OrderStatusBadge.tsx
DataTable.tsx
LoadingSpinner.tsx

// Props interface: [ComponentName]Props
interface UserCardProps { ... }
interface DataTableProps<T> { ... }
```

### Custom Hooks
- ขึ้นต้นด้วย `use` เสมอ
- ชื่อสื่อถึง state/behavior ที่จัดการ

```typescript
useUser(id: string)           // ดึงข้อมูล user
useUsers()                    // ดึงรายการ users
useCreateUser()               // mutation สร้าง user
useAuth()                     // authentication state
useModal()                    // modal open/close state
useDebounce(value, delay)     // debounce utility
usePagination(total, limit)   // pagination logic
```

### Event Handlers
```tsx
// ✅ ถูกต้อง — on + [Event] หรือ handle + [Action]
onClick={handleSubmit}
onClick={handleDeleteUser}
onChange={handleEmailChange}
onSubmit={handleFormSubmit}

// Props ที่รับ handler: on + [Event]
interface ButtonProps {
  onClick?: () => void;
  onChange?: (value: string) => void;
}
```

---

## 6. Database — PostgreSQL + Prisma

### Table Names (snake_case, plural)
```
users
orders
order_items
product_categories
user_profiles
refresh_tokens
audit_logs
```

### Column Names (snake_case)
```
id
user_id
created_at
updated_at
deleted_at
is_active
email_verified_at
first_name
last_name
```

### Prisma Model vs Table Mapping
```prisma
// Model: PascalCase singular → Table: snake_case plural
model User {
  @@map("users")
}

model OrderItem {
  @@map("order_items")
}

model ProductCategory {
  @@map("product_categories")
}
```

### Index & Constraint Names
```sql
-- Pattern: [type]_[table]_[column(s)]
idx_users_email
idx_orders_user_id_created_at
uq_users_email
fk_orders_user_id
```

---

## 7. Environment Variables
- ใช้ `SCREAMING_SNAKE_CASE` เสมอ
- ขึ้นต้นด้วย prefix ที่บอกหมวดหมู่

```env
# Database
DATABASE_URL=

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=

# App
APP_PORT=3000
APP_URL=https://example.com
NODE_ENV=production

# Third-party
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## 8. Git Branch & Commit

### Branch Names
```
// Pattern: [type]/[ticket-id]-[short-description]
feature/US-001-user-authentication
feature/US-042-order-management
fix/BUG-015-login-redirect
hotfix/SEC-003-sql-injection
chore/update-dependencies
refactor/user-service-cleanup
```

### Commit Messages (Conventional Commits)
```
feat: เพิ่มระบบ authentication ด้วย JWT
fix: แก้ไขปัญหา redirect หลัง login
docs: อัปเดต API documentation
chore: อัปเดต dependencies
refactor: ปรับโครงสร้าง UserService
test: เพิ่ม unit test สำหรับ OrderService
style: จัดรูปแบบโค้ดตาม ESLint rules
```
