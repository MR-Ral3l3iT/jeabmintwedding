---
name: coding-standard
description: มาตรฐานการเขียนโค้ดสำหรับทีมพัฒนา Web Application ที่ใช้ NestJS (Backend) + Next.js TypeScript (Frontend) + PostgreSQL + Prisma ใช้ทุกครั้งที่เขียนหรือ review โค้ดในโปรเจกต์นี้
---

# Coding Standard
มาตรฐานการเขียนโค้ดสำหรับ Web Application Stack: NestJS + Next.js (TypeScript) + TailwindCSS + PostgreSQL + Prisma

---

## 1. ภาษาและ TypeScript

- ใช้ **TypeScript** ทุก file ทั้ง Frontend และ Backend
- ห้ามใช้ `any` เด็ดขาด → ใช้ `unknown` หรือกำหนด type ที่ชัดเจน
- ทุก function ต้องระบุ return type เสมอ
- ใช้ `interface` สำหรับ object shape, ใช้ `type` สำหรับ union/intersection
- เปิดใช้ `strict: true` ใน tsconfig.json เสมอ

```typescript
// ✅ ถูกต้อง
interface CreateUserDto {
  name: string;
  email: string;
  role: UserRole;
}

async function createUser(dto: CreateUserDto): Promise<User> { ... }

// ❌ ผิด
async function createUser(dto: any) { ... }
```

---

## 2. โครงสร้างโค้ดทั่วไป

### การจัดการ Error
- Backend: ใช้ NestJS built-in exceptions เสมอ (`NotFoundException`, `BadRequestException` ฯลฯ)
- Frontend: ใช้ try/catch + แสดง error message ที่เหมาะสมให้ผู้ใช้
- ห้าม `console.log` ใน production → ใช้ Logger ของ NestJS แทน

```typescript
// ✅ Backend - ถูกต้อง
import { NotFoundException } from '@nestjs/common';

async findOne(id: string): Promise<User> {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundException(`User ${id} not found`);
  return user;
}

// ✅ Frontend - ถูกต้อง
try {
  const data = await fetchUser(id);
  setUser(data);
} catch (error) {
  setErrorMessage('ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง');
}
```

### Async/Await
- ใช้ `async/await` เสมอ ห้ามใช้ `.then().catch()` แบบ chain ยาว
- ทุก async function ต้องมี try/catch หรือมี global exception handler รองรับ

---

## 3. Backend — NestJS

### โครงสร้าง Module
```
src/
├── modules/
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── dto/
│       │   ├── create-user.dto.ts
│       │   └── update-user.dto.ts
│       └── entities/
│           └── user.entity.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── prisma/
│   └── prisma.service.ts
└── main.ts
```

### Controller
- ทำหน้าที่รับ request และส่งต่อให้ Service เท่านั้น ห้ามใส่ business logic
- ใช้ DTO + `ValidationPipe` ทุก endpoint
- ใช้ Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) ทุก endpoint

```typescript
@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'สร้างผู้ใช้ใหม่' })
  @ApiResponse({ status: 201, description: 'สร้างสำเร็จ', type: UserResponseDto })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }
}
```

### Service
- Business logic ทั้งหมดอยู่ที่นี่
- ติดต่อ Database ผ่าน Prisma เท่านั้น
- ห้าม return Prisma model โดยตรง → map เป็น DTO ก่อนเสมอ

### DTO Validation
- ใช้ `class-validator` + `class-transformer` ทุก DTO
- ทุก field ต้องมี decorator validation และ `@ApiProperty`

```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'สมชาย ใจดี' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'somchai@example.com' })
  @IsEmail()
  email: string;
}
```

---

## 4. Frontend — Next.js (TypeScript + TailwindCSS + Lucide)

### โครงสร้างโฟลเดอร์
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/
│   ├── (dashboard)/
│   └── layout.tsx
├── components/
│   ├── ui/                 # Reusable UI components
│   └── features/           # Feature-specific components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── api/                # API call functions
│   └── utils/              # Utility functions
├── types/                  # TypeScript type definitions
└── stores/                 # State management (Zustand/Context)
```

### Component
- ใช้ **Functional Component** เสมอ ห้ามใช้ Class Component
- ทุก component ต้องกำหนด Props interface
- แยก Server Component / Client Component ให้ชัดเจน (`'use client'`)
- ชื่อ component ใช้ PascalCase

```tsx
// ✅ ถูกต้อง
interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
    </div>
  );
}
```

### TailwindCSS
- ห้ามเขียน inline style (`style={{}}`) ยกเว้นค่าที่ dynamic จริงๆ
- ใช้ `cn()` utility สำหรับ conditional class
- จัดกลุ่ม class ตามลำดับ: Layout → Spacing → Typography → Color → Effect

```tsx
// ✅ ถูกต้อง
<button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
  <Plus className="h-4 w-4" />
  เพิ่มรายการ
</button>
```

### Lucide Icons
- ใช้ขนาด icon สม่ำเสมอ: `h-4 w-4` (small), `h-5 w-5` (default), `h-6 w-6` (large)
- ใส่ `aria-hidden="true"` ทุกครั้งที่ icon เป็นแค่ decoration

```tsx
import { Plus, Pencil, Trash2 } from 'lucide-react';

<Plus className="h-4 w-4" aria-hidden="true" />
```

---

## 5. Database — PostgreSQL + Prisma

### Prisma Schema
- ทุก model ต้องมี `id`, `createdAt`, `updatedAt`
- ใช้ `cuid()` หรือ `uuid()` สำหรับ primary key
- ตั้งชื่อ model เป็น PascalCase singular (`User` ไม่ใช่ `Users`)
- ใช้ `@@map` เพื่อกำหนดชื่อ table ใน DB เป็น snake_case

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### Prisma Query
- ใช้ `select` เพื่อดึงเฉพาะ field ที่ต้องการ ห้ามดึงทุก field โดยไม่จำเป็น
- ใช้ transaction (`$transaction`) เมื่อมีการเขียนข้อมูลหลาย table พร้อมกัน
- ใส่ pagination (`skip`, `take`) ทุก query ที่ดึงข้อมูลหลายรายการ

```typescript
// ✅ ถูกต้อง
const users = await this.prisma.user.findMany({
  select: { id: true, name: true, email: true, role: true },
  where: { isActive: true },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

### Swagger (OpenAPI)
- ทุก API endpoint ต้องมี Swagger documentation ครบถ้วน
- ใช้ `@nestjs/swagger` decorators บน Controller และ DTO
- กำหนด response schema ทุก status code ที่เป็นไปได้

---

## 6. สิ่งที่ห้ามทำเด็ดขาด

| ห้าม | เหตุผล |
|------|--------|
| ใช้ `any` ใน TypeScript | ทำลาย type safety |
| Hardcode credential/secret ใน code | Security risk |
| `console.log` ใน production code | ใช้ Logger แทน |
| Business logic ใน Controller | ผิด separation of concerns |
| ดึงข้อมูลทั้งหมดโดยไม่มี pagination | Performance |
| Inline style แทน Tailwind class | ผิด convention |
| Return Prisma model โดยตรงจาก Service | Expose internal schema |
