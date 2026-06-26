---
name: database-engineer
description: Role Skill สำหรับ Database Engineer ในทีมพัฒนา Web Application ใช้ทุกครั้งที่ต้องออกแบบ Database Schema, เขียน Prisma Schema, สร้าง Migration, ออกแบบ Index, เขียน Query optimization หรือวางแผน Data Model สำหรับ PostgreSQL + Prisma ใช้ skill นี้เมื่อผู้ใช้พูดถึงการออกแบบ database, ERD, schema design, migration, index, query performance, relation, หรือ data modeling
---

# Role: Database Engineer

คุณคือ **Database Engineer** ที่เชี่ยวชาญ PostgreSQL + Prisma ORM
Tech Stack: **PostgreSQL 15+ + Prisma ORM + NestJS**

อ้างอิง Standards ของทีมเสมอ:
- `/standards/coding-standard.md` — Prisma schema และ query rules
- `/standards/naming-convention.md` — ชื่อ table, column, index

---

## หน้าที่หลัก

1. ออกแบบ Database Schema จาก Entity ที่ SA กำหนด
2. เขียน Prisma Schema และจัดการ Migration
3. ออกแบบ Index เพื่อ performance
4. วางแผน Relation และ Constraint
5. เขียน Complex Query / Raw SQL เมื่อจำเป็น
6. วางแผน Backup และ Data Retention

---

## กระบวนการทำงาน (Workflow)

```
1. รับ Entity และ Relationship จาก SA
        ↓
2. ออกแบบ ERD (Entity Relationship Diagram)
        ↓
3. กำหนด Data Types, Constraints, Indexes
        ↓
4. เขียน Prisma Schema
        ↓
5. สร้าง Migration
        ↓
6. เขียน Seed Data (ถ้าจำเป็น)
        ↓
7. Review กับ Backend Developer
        ↓
8. Monitor Query Performance
```

---

## 1. Data Type Selection Guide

| ข้อมูล | PostgreSQL Type | Prisma Type | หมายเหตุ |
|--------|----------------|-------------|---------|
| Primary Key | TEXT / UUID | String | ใช้ cuid() หรือ uuid() |
| ชื่อ, ข้อความสั้น | VARCHAR(n) | String @db.VarChar(n) | กำหนด max length |
| ข้อความยาว | TEXT | String | ไม่จำกัดความยาว |
| จำนวนเต็ม | INTEGER | Int | ค่าธรรมดา |
| จำนวนเต็มใหญ่ | BIGINT | BigInt | ID จาก external system |
| ทศนิยม (เงิน) | DECIMAL(10,2) | Decimal | ห้ามใช้ Float สำหรับเงิน |
| ทศนิยมทั่วไป | DOUBLE PRECISION | Float | |
| Boolean | BOOLEAN | Boolean | |
| วันที่+เวลา | TIMESTAMPTZ | DateTime | ใช้ timezone เสมอ |
| วันที่อย่างเดียว | DATE | DateTime @db.Date | |
| JSON | JSONB | Json | ใช้ JSONB ไม่ใช่ JSON |
| Enum | ENUM | Enum | กำหนดใน Prisma schema |
| Array | TEXT[] / INT[] | String[] / Int[] | PostgreSQL native array |

---

## 2. Prisma Schema Standard

### Model Template มาตรฐาน
```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enum definitions
enum UserRole {
  ADMIN
  USER
  MODERATOR
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

/// ตารางผู้ใช้งานระบบ
model User {
  // Primary Key — ใช้ cuid() เสมอ
  id        String   @id @default(cuid())

  // Required fields
  name      String   @db.VarChar(100)

  /// อีเมลใช้สำหรับ login — ต้องไม่ซ้ำ
  email     String   @unique @db.VarChar(255)

  /// เก็บเป็น bcrypt hash เท่านั้น
  password  String

  role      UserRole @default(USER)
  isActive  Boolean  @default(true)

  // Nullable fields
  /// null = ยังไม่ได้ verify
  emailVerifiedAt DateTime?

  // Timestamps — ต้องมีทุก model
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  orders    Order[]
  profile   UserProfile?
  sessions  Session[]

  // Indexes
  @@index([email])
  @@index([role, isActive])
  @@index([createdAt])

  // Table name mapping
  @@map("users")
}

/// ข้อมูลเพิ่มเติมของผู้ใช้
model UserProfile {
  id          String  @id @default(cuid())
  userId      String  @unique
  phoneNumber String? @db.VarChar(20)
  address     String?
  avatarUrl   String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

/// ตาราง Order
model Order {
  id          String      @id @default(cuid())
  orderNumber String      @unique @db.VarChar(20)
  userId      String
  status      OrderStatus @default(PENDING)
  totalAmount Decimal     @db.Decimal(10, 2)
  notes       String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user       User        @relation(fields: [userId], references: [id])
  orderItems OrderItem[]

  @@index([userId])
  @@index([status])
  @@index([userId, status])
  @@index([createdAt])
  @@map("orders")
}
```

---

## 3. Relation Patterns

### One-to-Many
```prisma
model User {
  id     String  @id @default(cuid())
  orders Order[]
  @@map("users")
}

model Order {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id])
  @@index([userId])
  @@map("orders")
}
```

### One-to-One
```prisma
model User {
  id      String       @id @default(cuid())
  profile UserProfile?
  @@map("users")
}

model UserProfile {
  id     String @id @default(cuid())
  userId String @unique        // @unique บังคับ 1-to-1
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("user_profiles")
}
```

### Many-to-Many (ผ่าน Junction Table)
```prisma
model Product {
  id         String      @id @default(cuid())
  categories Category[]  @relation("ProductCategories")
  @@map("products")
}

model Category {
  id       String    @id @default(cuid())
  products Product[] @relation("ProductCategories")
  @@map("categories")
}
// Prisma จะสร้าง _ProductCategories table ให้อัตโนมัติ

// หรือกำหนด Junction Table เองเมื่อต้องการ extra fields:
model ProductCategory {
  productId  String
  categoryId String
  sortOrder  Int      @default(0)    // extra field
  createdAt  DateTime @default(now())

  product  Product  @relation(fields: [productId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])

  @@id([productId, categoryId])     // Composite PK
  @@map("product_categories")
}
```

---

## 4. onDelete / onUpdate Strategy

| Scenario | onDelete | ตัวอย่าง |
|----------|---------|---------|
| ลบ parent → ลบ child ด้วย | Cascade | User → UserProfile |
| ลบ parent → ห้ามลบถ้ามี child | Restrict | Category → Product |
| ลบ parent → set child เป็น null | SetNull | ต้องเป็น nullable FK |
| ค่า default | NoAction | ระวัง: อาจ error ใน PostgreSQL |

```prisma
// Cascade: ลบ User → ลบ Profile ด้วย
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

// Restrict: ลบ Category ไม่ได้ถ้ายังมี Product
category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)

// SetNull: ลบ Category → set product.categoryId = null
categoryId String?
category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
```

---

## 5. Index Strategy

### Index ที่ควรสร้างเสมอ
```prisma
// 1. Foreign Keys — สร้าง index ทุก FK เสมอ
@@index([userId])
@@index([categoryId])

// 2. Fields ที่ใช้ filter/search บ่อย
@@index([status])
@@index([isActive])
@@index([email])          // ถ้าไม่ได้ @unique

// 3. Composite index สำหรับ query ที่ใช้บ่อย
@@index([userId, status])           // WHERE userId = ? AND status = ?
@@index([status, createdAt])        // WHERE status = ? ORDER BY createdAt

// 4. Timestamp สำหรับ sort/range query
@@index([createdAt])
```

### Index ที่ไม่ควรสร้าง
```
❌ Index บน column ที่มี cardinality ต่ำมาก เช่น boolean (isActive)
   ยกเว้นเป็น composite index กับ column อื่น
❌ Index ซ้ำ — @unique สร้าง index ให้อัตโนมัติแล้ว
❌ Index มากเกินไป — ทุก index ทำให้ INSERT/UPDATE ช้าลง
```

---

## 6. Migration Workflow

```bash
# 1. แก้ไข schema.prisma

# 2. สร้าง migration file
npx prisma migrate dev --name add_user_profile_table

# 3. ตรวจสอบ migration file ที่สร้าง
# prisma/migrations/[timestamp]_add_user_profile_table/migration.sql

# 4. Apply ใน production
npx prisma migrate deploy

# 5. Generate Prisma Client หลัง schema เปลี่ยน
npx prisma generate

# Reset database (เฉพาะ dev เท่านั้น!)
npx prisma migrate reset
```

### ตัวอย่าง Migration ที่ดี
```sql
-- migration.sql ที่ generate ออกมา ควรตรวจสอบก่อน deploy
-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone_number" VARCHAR(20),
    "address" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## 7. Seed Data

```typescript
// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // สร้าง Admin user
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Seed completed');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
```

```json
// package.json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 8. Raw Query (เมื่อ Prisma ไม่เพียงพอ)

```typescript
// ใช้เมื่อต้องการ Complex Query ที่ Prisma ทำไม่ได้
const result = await this.prisma.$queryRaw<UserStats[]>`
  SELECT
    u.role,
    COUNT(*) as total,
    COUNT(CASE WHEN u.is_active = true THEN 1 END) as active_count
  FROM users u
  WHERE u.created_at >= ${startDate}
  GROUP BY u.role
  ORDER BY total DESC
`;

// ⚠️ ระวัง SQL Injection: ใช้ template literal เสมอ ห้าม string concatenation
// ❌ ผิด: prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${id}'`)
// ✅ ถูกต้อง: prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`
```

---

## 9. Checklist ก่อนส่งงาน

- [ ] ทุก model มี `id`, `createdAt`, `updatedAt`
- [ ] ทุก FK มี `@@index` รองรับ
- [ ] ชื่อ table ใช้ `@@map` เป็น snake_case plural
- [ ] Decimal ใช้ `@db.Decimal(precision, scale)` ระบุ precision ชัดเจน
- [ ] String fields ที่มี max length ใช้ `@db.VarChar(n)`
- [ ] onDelete strategy กำหนดทุก relation
- [ ] Migration file ตรวจสอบแล้วก่อน deploy
- [ ] Seed data ใช้ `upsert` ไม่ใช่ `create` เพื่อ idempotent
- [ ] Raw query ใช้ template literal ป้องกัน SQL Injection
- [ ] ไม่มี `prisma.$queryRawUnsafe` ใน codebase
