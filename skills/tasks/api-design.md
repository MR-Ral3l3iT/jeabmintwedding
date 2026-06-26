---
name: api-design
description: Task Skill สำหรับการออกแบบ REST API ใช้ทุกครั้งที่ต้องออกแบบ API endpoints, กำหนด Request/Response schema, วางแผน Authentication flow, หรือสร้าง API Documentation สำหรับ NestJS + Swagger ใช้ skill นี้เมื่อผู้ใช้พูดถึงการออกแบบ API, endpoint design, REST API, request/response schema, API contract, หรือ Swagger spec
---

# Task: API Design

งานนี้ใช้ร่วมกับ Role: **System Analyst** และ **Backend Developer**
อ้างอิง: `/standards/naming-convention.md` (API Endpoint section)

---

## ขั้นตอนการทำงาน

```
Step 1: รับ User Stories และ Entity จาก SA
        ↓
Step 2: กำหนด Resources และ Endpoints
        ↓
Step 3: ออกแบบ Request / Response Schema
        ↓
Step 4: กำหนด Authentication & Authorization
        ↓
Step 5: กำหนด Error Responses
        ↓
Step 6: เขียน API Contract Document
```

---

## Step 1: REST API Naming Rules

```
Base URL: /api

Resources ใช้ noun, lowercase, kebab-case, plural:
  ✅ /api/users
  ✅ /api/order-items
  ✅ /api/product-categories
  ❌ /api/getUsers
  ❌ /api/createOrder

HTTP Methods:
  GET    → ดึงข้อมูล (ไม่เปลี่ยน state)
  POST   → สร้างใหม่
  PATCH  → แก้ไขบางส่วน (ใช้ PATCH ไม่ใช่ PUT)
  DELETE → ลบ

Nested Resources:
  GET /api/users/:userId/orders       → orders ของ user นั้น
  POST /api/users/:userId/orders      → สร้าง order ของ user
  GET /api/orders/:orderId/items      → items ของ order นั้น
```

---

## Step 2: Standard Endpoint Set (CRUD)

ทุก Resource ใหม่ให้ออกแบบตาม pattern นี้:

```markdown
## Resource: Users

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | /api/users | ✅ | ADMIN | ดึงรายการ users (paginated) |
| POST | /api/users | ✅ | ADMIN | สร้าง user ใหม่ |
| GET | /api/users/:id | ✅ | ADMIN / ตัวเอง | ดึง user ตาม id |
| PATCH | /api/users/:id | ✅ | ADMIN / ตัวเอง | แก้ไข user |
| DELETE | /api/users/:id | ✅ | ADMIN | ลบ user (soft delete) |

## Resource: Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | สมัครสมาชิก |
| POST | /api/auth/login | ❌ | เข้าสู่ระบบ |
| POST | /api/auth/logout | ✅ | ออกจากระบบ |
| POST | /api/auth/refresh-token | ❌ | รับ access token ใหม่ |
| POST | /api/auth/forgot-password | ❌ | ขอรีเซ็ตรหัสผ่าน |
| POST | /api/auth/reset-password | ❌ | ตั้งรหัสผ่านใหม่ |
| POST | /api/auth/verify-email | ❌ | ยืนยัน email |
```

---

## Step 3: Request / Response Schema

### Query Parameters (GET list)
```markdown
## GET /api/users — Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | หน้าที่ต้องการ (>= 1) |
| limit | number | No | 20 | รายการต่อหน้า (1-100) |
| search | string | No | - | ค้นหาจาก name, email |
| role | UserRole | No | - | filter: ADMIN / USER |
| isActive | boolean | No | - | filter สถานะ |
| sortBy | string | No | createdAt | field ที่ sort |
| sortOrder | asc/desc | No | desc | ทิศทาง sort |
```

### Request Body Schema
```markdown
## POST /api/users — Request Body

{
  "name": string,       // required, max 100 chars
  "email": string,      // required, valid email format
  "password": string,   // required, min 8 chars
  "role": "ADMIN" | "USER"  // optional, default: "USER"
}

## PATCH /api/users/:id — Request Body (ทุก field optional)

{
  "name": string,       // optional, max 100 chars
  "role": "ADMIN" | "USER",  // optional
  "isActive": boolean   // optional
}
```

### Response Schema (Standard Format)
```markdown
## Standard Response Wrapper

// Success (single item)
{
  "data": { ... },
  "statusCode": 200
}

// Success (list with pagination)
{
  "data": {
    "data": [ ... ],
    "total": 48,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  },
  "statusCode": 200
}

// Error
{
  "statusCode": 400,
  "message": "อีเมลนี้ถูกใช้งานแล้ว",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users"
}

// Validation Error (400)
{
  "statusCode": 400,
  "message": [
    "name must not be empty",
    "email must be an email"
  ],
  "timestamp": "...",
  "path": "/api/users"
}
```

### User Response DTO
```markdown
## UserResponseDto

{
  "id": "clxxx...",
  "name": "สมชาย ใจดี",
  "email": "somchai@example.com",
  "role": "USER",
  "isActive": true,
  "emailVerifiedAt": "2024-01-15T10:00:00.000Z" | null,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
// หมายเหตุ: ไม่ส่ง password กลับไปเด็ดขาด
```

---

## Step 4: Authentication & Authorization Design

### JWT Flow
```
[Client]                    [Backend]
   │                             │
   ├── POST /api/auth/login ────>│
   │   { email, password }       │
   │                             ├── validate credentials
   │                             ├── create accessToken (15m)
   │                             ├── create refreshToken (7d)
   │                             ├── save refreshToken in DB
   │<── 200 OK ─────────────────┤
   │    { accessToken, user }    ├── Set-Cookie: refreshToken (httpOnly)
   │                             │
   ├── GET /api/users ──────────>│
   │   Authorization: Bearer ... │
   │                             ├── validate JWT
   │<── 200 OK ─────────────────┤
   │                             │
   ├── POST /api/auth/refresh ──>│ (cookie ส่งอัตโนมัติ)
   │                             ├── validate refreshToken in DB
   │                             ├── create new accessToken
   │<── 200 OK ─────────────────┤
   │    { accessToken }          │
```

### Authorization Levels
```markdown
| Level | Description | ใช้กับ Endpoint |
|-------|-------------|----------------|
| Public | ไม่ต้อง auth | /auth/login, /auth/register |
| Authenticated | ต้อง login | ดู/แก้ข้อมูลตัวเอง |
| Admin | ต้อง role ADMIN | จัดการ users, settings |
| Owner | ต้องเป็นเจ้าของ resource | แก้โปรไฟล์ตัวเอง |
```

---

## Step 5: HTTP Status Codes

```markdown
## Status Codes ที่ใช้

| Code | ใช้เมื่อ | ตัวอย่าง |
|------|---------|---------|
| 200 OK | GET, PATCH สำเร็จ | ดึง user สำเร็จ |
| 201 Created | POST สร้างสำเร็จ | สร้าง user ใหม่ |
| 204 No Content | DELETE สำเร็จ | ลบ user |
| 400 Bad Request | Validation ผิด | email format ผิด |
| 401 Unauthorized | ไม่มี / token หมดอายุ | ไม่ได้ login |
| 403 Forbidden | ไม่มีสิทธิ์ | User เข้า Admin route |
| 404 Not Found | ไม่พบ resource | User id ไม่มี |
| 409 Conflict | ข้อมูลซ้ำ | Email ซ้ำ |
| 422 Unprocessable | Business logic error | สั่งซื้อสินค้าหมด |
| 500 Internal Error | Server error | Database down |
```

---

## Step 6: API Contract Document Template

```markdown
# API Contract: [Module Name]
Version: 1.0 | วันที่: [DD/MM/YYYY]

## Base URL
- Development: http://localhost:3001/api
- Staging: https://staging-api.example.com/api
- Production: https://api.example.com/api

## Authentication
ทุก endpoint ที่ require auth ต้องส่ง:
Header: `Authorization: Bearer <accessToken>`

## Endpoints

### [Resource Name]

#### GET /api/[resource]
**Description:** ...
**Auth:** Required / Not Required
**Role:** ADMIN / USER / All

**Query Parameters:**
| Param | Type | Required | Description |
...

**Response 200:**
```json
{ ... }
```

**Response 401:**
```json
{ "statusCode": 401, "message": "Unauthorized" }
```

---

## Checklist ก่อนส่งให้ Backend Developer

- [ ] ทุก endpoint ระบุ HTTP method ถูกต้อง
- [ ] URL ใช้ kebab-case, noun, plural
- [ ] ทุก endpoint ระบุ auth requirement ชัดเจน
- [ ] Request schema ระบุ required/optional และ validation rules
- [ ] Response schema ครบทุก success case
- [ ] Error responses ครบทุก HTTP status ที่เป็นไปได้
- [ ] ไม่มี verb ใน URL
- [ ] Paginated endpoints มี query params ครบ
- [ ] ไม่ส่ง sensitive data (password, token) ใน response body
```
