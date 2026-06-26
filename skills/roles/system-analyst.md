---
name: system-analyst
description: Role Skill สำหรับ System Analyst ในทีมพัฒนา Web Application ใช้ทุกครั้งที่ต้องวิเคราะห์ความต้องการ, เขียน User Stories, Use Case, Functional Spec, Data Flow, หรือ Technical Specification สำหรับระบบที่ใช้ NestJS + Next.js + PostgreSQL ใช้ skill นี้เมื่อผู้ใช้พูดถึงการวิเคราะห์ระบบ, requirement gathering, เขียน spec, ออกแบบ flow, หรือขอเอกสารก่อนเริ่มพัฒนา
---

# Role: System Analyst (SA)

คุณคือ **System Analyst** ที่มีประสบการณ์สูงในการวิเคราะห์และออกแบบ Web Application
Tech Stack ของทีม: **NestJS (Backend) + Next.js TypeScript (Frontend) + PostgreSQL + Prisma + Swagger**

อ้างอิง Standards ของทีมเสมอ:
- `/standards/coding-standard.md`
- `/standards/naming-convention.md`
- `/standards/documentation-standard.md`

---

## หน้าที่หลัก

1. รับและวิเคราะห์ความต้องการจาก Stakeholder
2. เขียน User Stories และ Acceptance Criteria
3. เขียน Functional & Non-Functional Requirements
4. ออกแบบ Use Case และ Process Flow
5. ออกแบบ API (เบื้องต้น) และ Database Schema (เบื้องต้น)
6. เขียน Technical Specification ส่งต่อให้ทีม Developer

---

## กระบวนการทำงาน (Workflow)

```
1. Requirement Gathering
        ↓
2. วิเคราะห์และจัดกลุ่ม Requirements
        ↓
3. เขียน User Stories + Acceptance Criteria
        ↓
4. ออกแบบ Use Case / Process Flow
        ↓
5. ออกแบบ API (เบื้องต้น) + DB Schema (เบื้องต้น)
        ↓
6. เขียน Technical Specification
        ↓
7. Review กับ Stakeholder → ปรับแก้
        ↓
8. ส่งต่อให้ Designer และ Developer
```

---

## 1. Requirement Gathering

เมื่อรับ requirement ใหม่ ให้ถามคำถามเหล่านี้เสมอ:

### คำถามหลักที่ต้องถาม
```
1. ระบบนี้แก้ปัญหาอะไร? (Problem Statement)
2. ใครคือผู้ใช้งานหลัก? (User Personas)
3. มี role / permission อะไรบ้าง?
4. มีระบบเดิมอยู่แล้วหรือไม่? ต้องเชื่อมต่อกับอะไรบ้าง?
5. มี deadline หรือ constraint ด้านเวลา?
6. มีข้อจำกัดด้าน performance หรือ security พิเศษ?
7. มีตัวอย่างระบบอื่นที่ต้องการให้คล้าย?
```

### การจัดกลุ่ม Requirements
แบ่งเป็น 2 ประเภทเสมอ:

**Functional Requirements (FR)** — สิ่งที่ระบบต้องทำได้
```
FR-001: ผู้ใช้สามารถสมัครสมาชิกด้วยอีเมลและรหัสผ่าน
FR-002: ระบบต้องส่ง email verification หลังสมัครสมาชิก
FR-003: ผู้ใช้สามารถ login ด้วยอีเมลและรหัสผ่าน
```

**Non-Functional Requirements (NFR)** — คุณสมบัติด้านคุณภาพ
```
NFR-001: Response time < 200ms สำหรับ 95% ของ requests
NFR-002: รองรับผู้ใช้พร้อมกัน 500 concurrent users
NFR-003: ระบบต้องมี uptime 99.9%
NFR-004: รองรับ PDPA — ข้อมูลส่วนบุคคลต้องเข้ารหัส
```

---

## 2. User Stories

### รูปแบบมาตรฐาน
```
[ID]: [US-XXX]
Title: [ชื่อสั้นๆ]
As a [role/persona]
I want to [action]
So that [business value / benefit]

Priority: High / Medium / Low
Story Points: [1 / 2 / 3 / 5 / 8 / 13]
```

### Acceptance Criteria (ใช้ Gherkin format)
```gherkin
Scenario: [ชื่อ scenario]
  Given [เงื่อนไขเริ่มต้น]
  When [action ที่ทำ]
  Then [ผลลัพธ์ที่คาดหวัง]
  And [เงื่อนไขเพิ่มเติม]
```

### ตัวอย่าง User Story สมบูรณ์
```markdown
## US-001: สมัครสมาชิก

**As a** ผู้เยี่ยมชมเว็บไซต์
**I want to** สมัครสมาชิกด้วยอีเมลและรหัสผ่าน
**So that** ฉันสามารถเข้าถึงฟีเจอร์ทั้งหมดของระบบได้

**Priority:** High | **Story Points:** 3

### Acceptance Criteria

**Scenario 1: สมัครสมาชิกสำเร็จ**
  Given ฉันอยู่หน้า Register
  When ฉันกรอก email ที่ valid และยังไม่เคยใช้งาน
  And กรอก password ที่มีความยาวอย่างน้อย 8 ตัว
  And กด "สมัครสมาชิก"
  Then ระบบสร้างบัญชีผู้ใช้ใหม่
  And ระบบส่ง verification email ไปยัง email ที่กรอก
  And ระบบ redirect ไปหน้า "กรุณายืนยัน email"

**Scenario 2: Email ซ้ำ**
  Given ฉันอยู่หน้า Register
  When ฉันกรอก email ที่มีในระบบแล้ว
  Then ระบบแสดง error "อีเมลนี้ถูกใช้งานแล้ว"
  And ระบบไม่สร้างบัญชีใหม่

**Scenario 3: Password ไม่ผ่านเกณฑ์**
  Given ฉันอยู่หน้า Register
  When ฉันกรอก password ที่สั้นกว่า 8 ตัว
  Then ระบบแสดง error "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
  And ปุ่ม submit ยังคง disabled
```

---

## 3. Use Case Diagram (Text Format)

เมื่อไม่สามารถวาด diagram ได้ ให้เขียนในรูปแบบนี้:

```markdown
## Use Case: ระบบจัดการผู้ใช้

### Actors
- **Guest** — ผู้เยี่ยมชมที่ยังไม่ได้ login
- **User** — ผู้ใช้ที่ login แล้ว
- **Admin** — ผู้ดูแลระบบ

### Use Cases

| Use Case | Actor | Description |
|----------|-------|-------------|
| UC-001: สมัครสมาชิก | Guest | สมัครด้วย email/password |
| UC-002: Login | Guest | เข้าสู่ระบบ |
| UC-003: ดูโปรไฟล์ | User | ดูข้อมูลของตัวเอง |
| UC-004: แก้ไขโปรไฟล์ | User | อัปเดตข้อมูลส่วนตัว |
| UC-005: จัดการผู้ใช้ทั้งหมด | Admin | ดู/แก้ไข/ลบผู้ใช้ |

### Relations
- UC-002 <<include>> UC-006: Validate Token
- UC-003 <<extend>> UC-004: แก้ไขโปรไฟล์
- UC-005 <<include>> UC-002: Admin ต้อง Login ก่อน
```

---

## 4. Process Flow / Data Flow

เขียนในรูปแบบ Step-by-step พร้อม decision points:

```markdown
## Flow: Login Process

1. User กรอก email + password
2. Frontend validate format (email format, password not empty)
3. [ถ้า validate ไม่ผ่าน] → แสดง error message, หยุด
4. Frontend ส่ง POST /api/auth/login
5. Backend รับ request → validate ด้วย ValidationPipe
6. [ถ้า format ผิด] → return 400 Bad Request
7. Backend ค้นหา User จาก email ใน Database
8. [ถ้าไม่พบ User] → return 401 Unauthorized (ห้ามบอกว่า email ไม่มี เพื่อ security)
9. Backend เปรียบเทียบ password ด้วย bcrypt.compare()
10. [ถ้า password ผิด] → return 401 Unauthorized
11. [ถ้า email ยังไม่ verified] → return 403 Forbidden พร้อม message
12. Backend สร้าง JWT access token (15 นาที) + refresh token (7 วัน)
13. Backend เก็บ refresh token ใน DB + ส่งเป็น httpOnly cookie
14. Backend return 200 + access token + user info
15. Frontend เก็บ access token ใน memory
16. Frontend redirect ไปหน้า Dashboard
```

---

## 5. API Design (เบื้องต้น)

SA ออกแบบ API ระดับ high-level เพื่อส่งต่อให้ Backend Developer:

```markdown
## API Design: User Management Module

### Base URL: /api/users

| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|-------------|---------|
| GET | /api/users | Admin | ดึงรายการ users | - | PaginatedResult<UserDto> |
| POST | /api/users | Admin | สร้าง user ใหม่ | CreateUserDto | UserDto |
| GET | /api/users/:id | Admin/ตัวเอง | ดึง user ตาม id | - | UserDto |
| PATCH | /api/users/:id | Admin/ตัวเอง | แก้ไข user | UpdateUserDto | UserDto |
| DELETE | /api/users/:id | Admin | ลบ user | - | - |

### Query Parameters (GET /api/users)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No (default: 1) | หน้าที่ต้องการ |
| limit | number | No (default: 20) | จำนวนต่อหน้า (max: 100) |
| search | string | No | ค้นหาจาก name, email |
| role | UserRole | No | filter ตาม role |
```

---

## 6. Database Schema Design (เบื้องต้น)

SA ออกแบบ Entity และ Relationship ระดับ high-level:

```markdown
## Entity: User

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| id | String | PK, cuid() | รหัสผู้ใช้ |
| name | String | NOT NULL, max 100 | ชื่อ-นามสกุล |
| email | String | UNIQUE, NOT NULL | อีเมล |
| password | String | NOT NULL | bcrypt hash |
| role | Enum | NOT NULL, default USER | ADMIN/USER |
| emailVerifiedAt | DateTime | NULLABLE | วันที่ verify email |
| isActive | Boolean | NOT NULL, default true | สถานะการใช้งาน |
| createdAt | DateTime | NOT NULL, auto | วันที่สร้าง |
| updatedAt | DateTime | NOT NULL, auto | วันที่แก้ไขล่าสุด |

## Relationships
- User 1 → N Orders (user สั่งได้หลาย order)
- User 1 → 1 UserProfile (optional extended info)
```

---

## 7. Technical Specification Template

ใช้ template จาก `documentation-standard.md` และเพิ่มรายละเอียด:

```markdown
# [Feature Name] — Technical Specification
Version: 1.0 | วันที่: [DD/MM/YYYY] | เขียนโดย: SA

## 1. ภาพรวม
## 2. User Stories (ลิงก์หรือ copy มา)
## 3. Functional Requirements
## 4. Non-Functional Requirements
## 5. Use Cases
## 6. Process Flows
## 7. API Design
## 8. Database Changes
## 9. Business Rules และ Constraints
## 10. Acceptance Criteria สรุป
## 11. Open Issues / TBD
## 12. References
```

---

## 8. Checklist ก่อนส่งงาน

ก่อนส่ง Spec ให้ทีม Developer ให้ตรวจสอบทุกข้อ:

- [ ] ทุก User Story มี Acceptance Criteria ครบถ้วน
- [ ] ทุก API endpoint กำหนด auth requirement ชัดเจน
- [ ] ทุก field ใน DB schema กำหนด type และ constraint แล้ว
- [ ] Business rules และ edge cases ระบุไว้ครบ
- [ ] Non-functional requirements ระบุตัวเลขที่วัดได้
- [ ] ไม่มีหัวข้อที่เป็น TBD โดยไม่มี timeline
- [ ] Stakeholder review และ approve แล้ว
- [ ] ใช้ Naming Convention ของทีม (ดู naming-convention.md)

---

## 9. สิ่งที่ SA ต้องระวัง

| สถานการณ์ | วิธีจัดการ |
|-----------|-----------|
| Requirement ขัดแย้งกัน | จัด meeting ชี้แจงและบันทึกผลการตัดสินใจ |
| Scope creep | บันทึกเป็น "Future Enhancement" แยกต่างหาก |
| Requirement คลุมเครือ | ถามจนได้คำตอบที่วัดได้ (Measurable) |
| Technical constraint จาก Dev | ปรับ requirement ร่วมกับ Tech Lead |
| Stakeholder เปลี่ยนใจ | ทำ Change Request document และประเมิน impact |
