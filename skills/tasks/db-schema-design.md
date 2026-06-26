---
name: db-schema-design
description: Task Skill สำหรับการออกแบบ Database Schema ใช้ทุกครั้งที่ต้องออกแบบ ERD, กำหนด Entity และ Relation, เขียน Prisma Schema, วางแผน Index หรือสร้าง Migration สำหรับ PostgreSQL + Prisma ใช้ skill นี้เมื่อผู้ใช้พูดถึงการออกแบบ database, ER diagram, data model, Prisma schema, table design, relation, foreign key หรือ migration
---

# Task: Database Schema Design

งานนี้ใช้ร่วมกับ Role: **Database Engineer**
อ้างอิง: `/standards/naming-convention.md` (Database section), `/standards/coding-standard.md` (Prisma section)

---

## ขั้นตอนการทำงาน

```
Step 1: รับ Entities จาก SA (Requirement Document)
        ↓
Step 2: ระบุ Entities และ Attributes
        ↓
Step 3: ออกแบบ Relationships
        ↓
Step 4: เลือก Data Types และ Constraints
        ↓
Step 5: กำหนด Indexes
        ↓
Step 6: เขียน Prisma Schema
        ↓
Step 7: สร้าง Migration
```

---

## Step 1: Entity Identification

จาก User Stories ระบุ Entities หลัก:

```markdown
## Entity List

| Entity | คำอธิบาย | มาจาก User Story |
|--------|---------|----------------|
| User | ผู้ใช้งานระบบ | US-001, US-002 |
| UserProfile | ข้อมูลเพิ่มเติมของ user | US-015 |
| Session | JWT refresh token | US-002 |
| Product | สินค้า | US-030 |
| Category | หมวดหมู่สินค้า | US-031 |
| Order | คำสั่งซื้อ | US-040 |
| OrderItem | รายการในคำสั่งซื้อ | US-040 |
```

---

## Step 2: ERD (Text Format)

```
User (1) ──────── (1) UserProfile
  │
  │ (1)
  │
  └──────── (N) Session
  │
  │ (1)
  │
  └──────── (N) Order
                │
                │ (1)
                │
                └──── (N) OrderItem (N) ──── (1) Product
                                                    │
                                                    │ (N)
                                                    │
                              Category (1) ──── (N) ProductCategory (N) ──── (1) Product
```

---

## Step 3: Relationship Design

### One-to-One: User → UserProfile
```
User.id ←── UserProfile.userId (UNIQUE)
onDelete: Cascade (ลบ User → ลบ Profile ด้วย)
```

### One-to-Many: User → Orders
```
User.id ←── Order.userId
onDelete: Restrict (ลบ User ไม่ได้ถ้ายังมี Order)
```

### Many-to-Many: Product ←→ Category
```
ผ่าน ProductCategory junction table
ProductCategory.productId ──→ Product.id
ProductCategory.categoryId ──→ Category.id
Composite PK: (productId, categoryId)
```

---

## Step 4: Prisma Schema Template

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ───────────────────────────────────────

enum UserRole {
  ADMIN
  USER
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

// ─── Models ──────────────────────────────────────

/// ตารางผู้ใช้งานระบบ
model User {
  id              String    @id @default(cuid())
  name            String    @db.VarChar(100)
  email           String    @unique @db.VarChar(255)
  password        String                          // bcrypt hash
  role            UserRole  @default(USER)
  isActive        Boolean   @default(true)
  emailVerifiedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  profile  UserProfile?
  sessions Session[]
  orders   Order[]

  @@index([role, isActive])
  @@index([createdAt])
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

/// Refresh token sessions
model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshToken String   @unique
  expiresAt    DateTime
  userAgent    String?
  ipAddress    String?  @db.VarChar(45)

  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("sessions")
}

/// หมวดหมู่สินค้า
model Category {
  id          String  @id @default(cuid())
  name        String  @db.VarChar(100)
  slug        String  @unique @db.VarChar(120)
  description String?
  isActive    Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  products ProductCategory[]

  @@index([slug])
  @@map("categories")
}

/// สินค้า
model Product {
  id          String  @id @default(cuid())
  name        String  @db.VarChar(200)
  slug        String  @unique @db.VarChar(220)
  description String?
  price       Decimal @db.Decimal(10, 2)
  stock       Int     @default(0)
  isActive    Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  categories  ProductCategory[]
  orderItems  OrderItem[]

  @@index([slug])
  @@index([isActive, price])
  @@map("products")
}

/// Junction table: Product ↔ Category
model ProductCategory {
  productId  String
  categoryId String
  sortOrder  Int      @default(0)
  createdAt  DateTime @default(now())

  product  Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([productId, categoryId])
  @@index([categoryId])
  @@map("product_categories")
}

/// คำสั่งซื้อ
model Order {
  id          String      @id @default(cuid())
  orderNumber String      @unique @db.VarChar(20)
  userId      String
  status      OrderStatus @default(PENDING)
  totalAmount Decimal     @db.Decimal(10, 2)
  notes       String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user       User        @relation(fields: [userId], references: [id], onDelete: Restrict)
  orderItems OrderItem[]

  @@index([userId])
  @@index([status])
  @@index([userId, status])
  @@index([createdAt])
  @@map("orders")
}

/// รายการในคำสั่งซื้อ
model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  unitPrice Decimal @db.Decimal(10, 2)  // snapshot ราคา ณ วันที่สั่ง
  subtotal  Decimal @db.Decimal(10, 2)  // quantity * unitPrice

  createdAt DateTime @default(now())

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}
```

---

## Step 5: Index Strategy Summary

```markdown
## Index Checklist

### สร้างเสมอ:
- [x] ทุก Foreign Key → @@index([fkField])
- [x] Fields ที่ใช้ WHERE บ่อย → status, isActive, role
- [x] Fields ที่ใช้ ORDER BY → createdAt
- [x] Fields ที่ใช้ค้นหา → slug (unique), email (unique)

### Composite Index (เมื่อมี query pattern ชัดเจน):
- [x] [userId, status] → query orders ของ user ตาม status
- [x] [isActive, price] → filter สินค้าที่ active, sort ตามราคา
- [x] [role, isActive] → filter users ตาม role และสถานะ

### ไม่สร้าง:
- [ ] Boolean เดี่ยวๆ เช่น @@index([isActive]) — cardinality ต่ำ
- [ ] Fields ที่ไม่เคยใช้ใน WHERE/ORDER BY
```

---

## Step 6: Migration Commands

```bash
# สร้าง migration ใหม่
npx prisma migrate dev --name <ชื่อ migration แบบ snake_case>

# ตัวอย่างการตั้งชื่อ
npx prisma migrate dev --name create_users_table
npx prisma migrate dev --name add_phone_to_user_profiles
npx prisma migrate dev --name add_index_orders_user_id

# Apply ใน production
npx prisma migrate deploy

# Generate Prisma Client หลัง schema เปลี่ยน
npx prisma generate
```

---

## Checklist ก่อนส่งงาน

- [ ] ทุก model มี `id`, `createdAt`, `updatedAt`
- [ ] ทุก FK มี `@@index`
- [ ] ชื่อ table ใช้ `@@map` เป็น snake_case plural
- [ ] `Decimal` ระบุ precision/scale ทุกครั้ง
- [ ] `String` ที่มี max length ใช้ `@db.VarChar(n)`
- [ ] `onDelete` strategy กำหนดทุก relation
- [ ] Enum values เป็น SCREAMING_SNAKE_CASE
- [ ] ไม่มีการเก็บ plaintext password หรือ secret
- [ ] Migration file ตรวจสอบแล้ว (อ่าน SQL ที่ generate)
- [ ] Seed ใช้ `upsert` เสมอ (idempotent)
