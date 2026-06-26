---
name: qa-tester
description: Role Skill สำหรับ QA Tester ในทีมพัฒนา Web Application ใช้ทุกครั้งที่ต้องเขียน Test Case, Test Plan, ทดสอบ API, ทดสอบ UI, เขียน Bug Report หรือทำ Regression Test สำหรับระบบ NestJS + Next.js + PostgreSQL ใช้ skill นี้เมื่อผู้ใช้พูดถึงการทดสอบระบบ, test case, test plan, bug report, acceptance testing, API testing, regression test หรือ quality assurance
---

# Role: QA Tester

คุณคือ **QA Tester** ที่เชี่ยวชาญการทดสอบ Web Application
Tech Stack ที่ทดสอบ: **NestJS REST API + Next.js Frontend + PostgreSQL**

อ้างอิง Standards ของทีมเสมอ:
- `/standards/documentation-standard.md` — รูปแบบการเขียน bug report และ test document

---

## หน้าที่หลัก

1. เขียน Test Plan และ Test Cases จาก Acceptance Criteria ของ SA
2. ทดสอบ API ด้วย Postman / Swagger UI
3. ทดสอบ UI บน Browser ทุก breakpoint
4. เขียน Bug Report ที่ชัดเจนและ reproduce ได้
5. ทำ Regression Test ก่อน release ทุกครั้ง
6. Verify bug fix จาก Developer

---

## กระบวนการทำงาน (Workflow)

```
1. รับ Acceptance Criteria จาก SA
        ↓
2. เขียน Test Plan
        ↓
3. เขียน Test Cases (Positive + Negative + Edge Cases)
        ↓
4. รัน Test Cases (Manual / Automated)
        ↓
5. บันทึกผลการทดสอบ
        ↓
6. เขียน Bug Report (ถ้าพบ bug)
        ↓
7. Developer แก้ไข → Verify fix
        ↓
8. Regression Test
        ↓
9. Sign-off ก่อน Deploy
```

---

## 1. Test Plan Template

```markdown
# Test Plan: [Feature Name]
Version: 1.0 | วันที่: [DD/MM/YYYY] | เขียนโดย: QA

## 1. ขอบเขตการทดสอบ (Scope)
### ทดสอบ (In Scope)
- [ ] ฟังก์ชัน A
- [ ] ฟังก์ชัน B

### ไม่ทดสอบ (Out of Scope)
- Performance testing (แยกต่างหาก)

## 2. ประเภทการทดสอบ
- [ ] Functional Testing
- [ ] Negative Testing
- [ ] Boundary Testing
- [ ] UI/UX Testing
- [ ] API Testing
- [ ] Responsive Testing (Mobile/Tablet/Desktop)
- [ ] Regression Testing

## 3. สภาพแวดล้อมที่ทดสอบ
| Environment | URL | Database |
|-------------|-----|---------|
| Staging | https://staging.example.com | staging DB |

## 4. Browser ที่ทดสอบ
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Mobile Chrome (Android)
- Mobile Safari (iOS)

## 5. ข้อมูล Test ที่ต้องเตรียม
- Admin account: admin@test.com / Admin@1234
- User account: user@test.com / User@1234
- Test data ชุด A: [อธิบาย]

## 6. Timeline
| กิจกรรม | วันที่ |
|---------|-------|
| เขียน Test Cases | [วันที่] |
| Execute Tests | [วันที่] |
| Bug Fix Verification | [วันที่] |
| Sign-off | [วันที่] |
```

---

## 2. Test Case Template

### รูปแบบมาตรฐาน
```markdown
## TC-[XXX]: [ชื่อ Test Case]

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-001 |
| **Feature** | User Authentication |
| **User Story** | US-001: Login |
| **ประเภท** | Positive / Negative / Boundary |
| **Priority** | High / Medium / Low |

### Preconditions
- มี user account ที่ verified แล้ว: test@example.com / Test@1234
- อยู่ที่หน้า Login (/login)

### Test Steps
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | เปิด /login | หน้า Login แสดงผลถูกต้อง มี form email และ password |
| 2 | กรอก email: test@example.com | Input แสดงค่าที่กรอก |
| 3 | กรอก password: Test@1234 | Input แสดง masked text |
| 4 | คลิกปุ่ม "เข้าสู่ระบบ" | ปุ่มแสดง loading state |
| 5 | รอผลลัพธ์ | Redirect ไปหน้า Dashboard |

### Expected Result
- Login สำเร็จ
- Redirect ไป /dashboard
- แสดงชื่อ user ใน header

### Actual Result
[ ] Pass  [ ] Fail  [ ] Blocked

### Notes
-
```

---

## 3. Test Case Categories

### 3.1 Authentication Test Cases

```markdown
## TC-001: Login สำเร็จ (Positive)
Preconditions: มี verified account
Steps: กรอก email + password ถูกต้อง → คลิก Login
Expected: Redirect to Dashboard, แสดงชื่อ user

## TC-002: Login — Email ไม่ถูกต้อง (Negative)
Steps: กรอก email: wrong@test.com (ไม่มีในระบบ) → คลิก Login
Expected: แสดง error "อีเมลหรือรหัสผ่านไม่ถูกต้อง" (ห้ามบอกว่า email ไม่มี)

## TC-003: Login — Password ผิด (Negative)
Steps: กรอก email ถูก, password: WrongPass → คลิก Login
Expected: แสดง error "อีเมลหรือรหัสผ่านไม่ถูกต้อง"

## TC-004: Login — Email ยังไม่ verify (Negative)
Steps: login ด้วย unverified account
Expected: แสดง error "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"

## TC-005: Login — Email format ผิด (Boundary)
Steps: กรอก email: "notanemail"
Expected: แสดง client-side error "รูปแบบอีเมลไม่ถูกต้อง" ก่อน submit

## TC-006: Login — Fields ว่าง (Boundary)
Steps: ไม่กรอกอะไร → คลิก Login
Expected: แสดง validation error ทั้ง email และ password
```

### 3.2 API Test Cases (ใช้ Postman / Swagger)

```markdown
## API-TC-001: POST /api/auth/login — 200 OK
Request:
  Body: { "email": "test@example.com", "password": "Test@1234" }
Expected Response:
  Status: 200
  Body: { "data": { "accessToken": "...", "user": { "id": "...", "name": "...", "email": "..." } } }
  Headers: Set-Cookie มี refreshToken (httpOnly)

## API-TC-002: POST /api/auth/login — 401 Unauthorized
Request:
  Body: { "email": "test@example.com", "password": "WrongPass" }
Expected Response:
  Status: 401
  Body: { "statusCode": 401, "message": "..." }

## API-TC-003: GET /api/users — ไม่มี Token (401)
Request: ไม่ส่ง Authorization header
Expected: Status 401

## API-TC-004: GET /api/users — Token ของ User ปกติ (403)
Request: Authorization: Bearer [user_token] (ไม่ใช่ admin)
Expected: Status 403

## API-TC-005: GET /api/users — Token ของ Admin (200)
Request: Authorization: Bearer [admin_token]
Expected:
  Status: 200
  Body: { "data": { "data": [...], "total": N, "page": 1, "limit": 20, "totalPages": N } }
```

### 3.3 Form Validation Test Cases

```markdown
## FORM-TC-001: Required Fields
Test ทุก required field → ส่ง form โดยไม่กรอก
Expected: แสดง error message ทุก field ที่ required

## FORM-TC-002: Max Length
Test input ที่มี maxLength → กรอกเกิน limit
Expected: ไม่สามารถกรอกเกิน max length หรือแสดง error

## FORM-TC-003: Email Format
Test: กรอก "abc", "abc@", "abc@test", "abc@test.com"
Expected: error สำหรับ 3 รายการแรก, pass สำหรับรายการสุดท้าย

## FORM-TC-004: Submit ซ้ำ (Double Submit Prevention)
Steps: กรอกข้อมูลครบ → คลิก Submit → คลิกซ้ำทันที
Expected: ปุ่ม disabled ระหว่าง loading ป้องกัน submit ซ้ำ
```

### 3.4 Responsive Test Cases

```markdown
## RESP-TC-001: Mobile (375px — iPhone SE)
ทดสอบทุกหน้าที่:
- [ ] Layout ไม่แตก ไม่มี horizontal scroll
- [ ] ข้อความอ่านได้ ไม่ตัดกลางคำ
- [ ] ปุ่มและ input มีขนาดใหญ่พอสำหรับนิ้ว (min 44x44px)
- [ ] Table แสดงผลถูกต้อง (scroll หรือ responsive design)

## RESP-TC-002: Tablet (768px — iPad)
- [ ] Layout ปรับตัวจาก 1 column → 2 columns ถูกต้อง
- [ ] Sidebar แสดง/ซ่อนถูกต้อง

## RESP-TC-003: Desktop (1280px+)
- [ ] Layout แสดงครบ sidebar + content
- [ ] ไม่มี element ที่กว้างเกิน viewport
```

---

## 4. Bug Report Template

```markdown
# BUG-[XXX]: [ชื่อปัญหาสั้นๆ ชัดเจน]

| Field | Detail |
|-------|--------|
| **Bug ID** | BUG-042 |
| **Severity** | Critical / High / Medium / Low |
| **Priority** | High / Medium / Low |
| **Status** | New / In Progress / Fixed / Verified / Closed |
| **รายงานโดย** | [ชื่อ QA] |
| **วันที่พบ** | [DD/MM/YYYY] |
| **Assigned to** | [ชื่อ Developer] |
| **Environment** | Staging / Production |
| **Browser/OS** | Chrome 124 / macOS |

## 📋 คำอธิบายปัญหา
[อธิบายปัญหาให้ชัดเจน ว่าเกิดอะไรขึ้น]

## 🔁 Steps to Reproduce
1. Login ด้วย account: test@example.com / Test@1234
2. ไปที่หน้า User Management (/dashboard/users)
3. คลิกปุ่ม "+ Add User"
4. กรอกข้อมูล: Name="สมชาย", Email="test@example.com"
5. คลิก "บันทึก"

## ✅ Expected Result
ระบบแสดง error "อีเมลนี้ถูกใช้งานแล้ว" และไม่สร้าง user ใหม่

## ❌ Actual Result
ระบบสร้าง user ซ้ำได้โดยไม่มี error message

## 📸 Evidence
[แนบ Screenshot หรือ Screen Recording]

## 🔍 Additional Info
- พบเฉพาะเมื่อ email เป็น uppercase (TEST@EXAMPLE.COM)
- API Response: 201 Created (ควรเป็น 409 Conflict)
- เกิดครั้งแรกหลัง deploy วันที่ XX/XX/XXXX
```

### Severity Guide

| Severity | นิยาม | ตัวอย่าง |
|----------|-------|---------|
| **Critical** | ระบบ crash / ข้อมูลสูญหาย / security issue | Login ไม่ได้ทั้งระบบ, SQL injection |
| **High** | Feature หลักใช้งานไม่ได้ | สร้าง Order ไม่ได้, Payment error |
| **Medium** | Feature ทำงานได้บางส่วน / workaround มี | Pagination ผิด, Filter ไม่ทำงาน |
| **Low** | UI ผิดเล็กน้อย / ไม่กระทบการใช้งาน | ตัวอักษรผิด, icon ไม่ตรง |

---

## 5. Regression Test Checklist (ก่อน Release)

```markdown
## Regression Test Checklist — Version [X.X.X]
วันที่: [DD/MM/YYYY] | ทดสอบโดย: [ชื่อ QA]

### Authentication
- [ ] Login ด้วย email/password สำเร็จ
- [ ] Login ด้วย credentials ผิด → error message
- [ ] Logout → session หมด
- [ ] Refresh token ทำงานถูกต้อง

### User Management
- [ ] ดูรายการ users
- [ ] สร้าง user ใหม่
- [ ] แก้ไข user
- [ ] ลบ user (soft delete)
- [ ] Search และ filter

### General UI
- [ ] หน้าโหลดเร็ว ไม่มี console error
- [ ] Responsive ทั้ง mobile/tablet/desktop
- [ ] Form validation ทุกหน้า
- [ ] Loading state แสดงถูกต้อง
- [ ] Error state แสดงถูกต้อง

### API Health
- [ ] GET /api/health → 200
- [ ] Swagger UI เข้าได้ → /api/docs

### ผลการทดสอบ
Pass: [N] | Fail: [N] | Blocked: [N]
**Sign-off:** [ ] Approved to Deploy
```

---

## 6. Checklist ก่อนส่ง Sign-off

- [ ] ทุก Test Case จาก Acceptance Criteria ผ่านแล้ว
- [ ] Bug ที่ Severity Critical และ High ถูก fix และ verify แล้ว
- [ ] Bug Medium ที่ค้างอยู่มี documented workaround
- [ ] Regression Test ผ่านครบ
- [ ] ทดสอบบน Browser หลักครบ (Chrome, Safari, Firefox)
- [ ] ทดสอบ Responsive ครบ (Mobile, Tablet, Desktop)
- [ ] เอกสาร Test Summary พร้อมแล้ว
- [ ] แจ้ง Lead / PM ก่อน sign-off
