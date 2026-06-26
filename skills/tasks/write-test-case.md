---
name: write-test-case
description: Task Skill สำหรับการเขียน Test Cases ใช้ทุกครั้งที่ต้องเขียน Test Cases จาก Acceptance Criteria, ครอบคลุม Positive/Negative/Boundary/API/UI testing สำหรับระบบ NestJS + Next.js ใช้ skill นี้เมื่อผู้ใช้พูดถึงการเขียน test case, test scenario, test script, การทดสอบ feature ใหม่, หรือขอ test coverage
---

# Task: Write Test Cases

งานนี้ใช้ร่วมกับ Role: **QA Tester**
อ้างอิง: `/standards/documentation-standard.md`

---

## ขั้นตอนการทำงาน

```
Step 1: รับ Acceptance Criteria จาก SA
        ↓
Step 2: แยกประเภท Test Cases
        ↓
Step 3: เขียน Positive Test Cases
        ↓
Step 4: เขียน Negative Test Cases
        ↓
Step 5: เขียน Boundary / Edge Cases
        ↓
Step 6: เขียน API Test Cases
        ↓
Step 7: เขียน UI / Responsive Test Cases
        ↓
Step 8: กำหนด Priority และ organize เป็น Test Suite
```

---

## Step 1: แยกประเภท Test Cases

| ประเภท | คำอธิบาย | ตัวอย่าง |
|--------|---------|---------|
| **Positive** | ทำถูกต้อง ได้ผลลัพธ์ที่ต้องการ | Login ด้วย credentials ถูกต้อง |
| **Negative** | ทำผิด ต้องได้ error ที่ถูกต้อง | Login ด้วย password ผิด |
| **Boundary** | ค่าขีดจำกัด min/max | Password ยาว 7 ตัว (ผิด) vs 8 ตัว (ถูก) |
| **Edge Case** | สถานการณ์พิเศษ | Input ที่มี HTML tag, emoji, ช่องว่าง |
| **API** | ทดสอบ endpoint โดยตรง | Response status, schema, headers |
| **UI** | ทดสอบ interface | Responsive, loading state, error state |

---

## Step 2: Test Case Template มาตรฐาน

```markdown
## [TC-XXX]: [ชื่อ Test Case ที่ชัดเจน]

| Field | Value |
|-------|-------|
| **TC ID** | TC-001 |
| **Feature** | [ชื่อ feature] |
| **User Story** | US-XXX |
| **ประเภท** | Positive / Negative / Boundary / API / UI |
| **Priority** | High / Medium / Low |
| **Preconditions** | [เงื่อนไขที่ต้องมีก่อน] |

### Test Steps
| # | Action | Expected Result |
|---|--------|----------------|
| 1 | [ทำอะไร] | [ผลที่คาดหวัง] |
| 2 | [ทำอะไร] | [ผลที่คาดหวัง] |

### Pass Criteria
[สรุปเงื่อนไขที่ถือว่า Pass]

### Result: [ ] Pass  [ ] Fail  [ ] Blocked
```

---

## Step 3: ตัวอย่าง Test Suite สมบูรณ์ — Auth Module

### Positive Test Cases

```markdown
## TC-001: Login สำเร็จ — User ปกติ
| Field | Value |
|-------|-------|
| **Feature** | Authentication |
| **User Story** | US-002 |
| **ประเภท** | Positive |
| **Priority** | High |
| **Preconditions** | มี account: test@example.com / Test@1234 (verified) |

### Test Steps
| # | Action | Expected Result |
|---|--------|----------------|
| 1 | เปิด /login | แสดงฟอร์ม login ถูกต้อง |
| 2 | กรอก email: test@example.com | แสดงค่าในช่อง email |
| 3 | กรอก password: Test@1234 | แสดง masked text |
| 4 | คลิก "เข้าสู่ระบบ" | ปุ่มแสดง loading |
| 5 | รอผล | Redirect ไป /dashboard |
| 6 | ตรวจสอบ header | แสดงชื่อ "ทดสอบ ระบบ" |

### Pass Criteria
- Redirect สำเร็จไป /dashboard
- แสดงชื่อ user ใน header
- URL = /dashboard (ไม่ redirect วนซ้ำ)
```

```markdown
## TC-002: Login สำเร็จ — Admin ถูก Redirect ไป Admin Dashboard
| **ประเภท** | Positive | **Priority** | High |
| **Preconditions** | มี admin account: admin@example.com / Admin@1234 |

### Test Steps
| # | Action | Expected Result |
|---|--------|----------------|
| 1 | Login ด้วย admin account | - |
| 2 | รอผล | Redirect ไป /dashboard/users (Admin landing page) |
```

### Negative Test Cases

```markdown
## TC-003: Login — Password ผิด
| **ประเภท** | Negative | **Priority** | High |
| **Preconditions** | มี account: test@example.com |

### Test Steps
| # | Action | Expected Result |
|---|--------|----------------|
| 1 | กรอก email: test@example.com | - |
| 2 | กรอก password: WrongPassword | - |
| 3 | คลิก "เข้าสู่ระบบ" | - |
| 4 | รอผล | แสดง error "อีเมลหรือรหัสผ่านไม่ถูกต้อง" |
| 5 | ตรวจสอบ URL | ยังอยู่ที่ /login |

### Pass Criteria
- ไม่ login เข้าระบบ
- แสดง error message ที่ไม่บอกว่า email หรือ password ที่ผิด (security)
```

```markdown
## TC-004: Login — Email ไม่มีในระบบ
| **ประเภท** | Negative | **Priority** | High |

### Test Steps
| # | Action | Expected Result |
|---|--------|----------------|
| 1 | กรอก email: notexist@example.com | - |
| 2 | กรอก password: AnyPass@1234 | - |
| 3 | คลิก Login | แสดง error "อีเมลหรือรหัสผ่านไม่ถูกต้อง" |

### Pass Criteria
- Error message เหมือนกับ TC-003 (ห้ามบอกว่า email ไม่มี — security)
```

```markdown
## TC-005: Login — Email ยังไม่ verified
| **ประเภท** | Negative | **Priority** | High |
| **Preconditions** | มี unverified account: unverified@example.com |

### Test Steps
| # | Action | Expected Result |
|---|--------|----------------|
| 1 | Login ด้วย unverified account | แสดง error "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ" |
| 2 | ตรวจสอบ | มี link "ส่ง email ยืนยันอีกครั้ง" |
```

### Boundary Test Cases

```markdown
## TC-006: Login — Password 7 ตัวอักษร (ต่ำกว่า min)
| **ประเภท** | Boundary | **Priority** | Medium |

### Test Steps
| # | Action | Expected Result |
|---|--------|----------------|
| 1 | กรอก password: "1234567" (7 ตัว) | แสดง error "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" ทันที |
| 2 | ตรวจสอบปุ่ม | Submit disabled |

## TC-007: Login — Password 8 ตัวอักษร (เท่า min)
| **ประเภท** | Boundary | **Priority** | Medium |

### Test Steps
| # | Action | Expected Result |
|---|--------|----------------|
| 1 | กรอก password: "12345678" (8 ตัว) | ไม่มี validation error |
| 2 | Submit | ดำเนินการต่อได้ปกติ |
```

### API Test Cases

```markdown
## API-TC-001: POST /api/auth/login — 200 OK
| **ประเภท** | API | **Priority** | High |
| **Tool** | Postman / Swagger UI |

### Request
```
Method: POST
URL: /api/auth/login
Body:
{
  "email": "test@example.com",
  "password": "Test@1234"
}
```

### Expected Response
```
Status: 200
Body:
{
  "data": {
    "accessToken": "<jwt_token>",
    "user": {
      "id": "<cuid>",
      "name": "...",
      "email": "test@example.com",
      "role": "USER"
    }
  },
  "statusCode": 200
}
Headers: Set-Cookie มี refreshToken (httpOnly=true, secure=true)
```

### Verify
- [ ] Status = 200
- [ ] `data.accessToken` มีค่า (string)
- [ ] `data.user.email` = "test@example.com"
- [ ] ไม่มี `password` ใน response
- [ ] Set-Cookie header มี refreshToken
```

```markdown
## API-TC-002: POST /api/auth/login — 401 Unauthorized

### Request: password ผิด
### Expected: Status 401, message ไม่บอก field ที่ผิด

## API-TC-003: POST /api/auth/login — 400 Bad Request (Validation)

### Request: email format ผิด
```json
{ "email": "notanemail", "password": "Test@1234" }
```
### Expected: Status 400, message validation error

## API-TC-004: GET /api/users — ไม่ส่ง Token
### Expected: Status 401

## API-TC-005: GET /api/users — Token ของ User (ไม่ใช่ Admin)
### Expected: Status 403
```

### UI / Responsive Test Cases

```markdown
## UI-TC-001: หน้า Login — Mobile (375px)
| **ประเภท** | UI | **Priority** | Medium |

### Test Steps
| # | Action | Expected Result |
|---|--------|----------------|
| 1 | เปิดหน้า /login บน mobile (375px) | layout ไม่แตก ไม่มี horizontal scroll |
| 2 | ตรวจสอบ form | กว้างเต็มหน้าจอ margin 16px |
| 3 | ตรวจสอบปุ่ม | ความสูงอย่างน้อย 44px (touch target) |
| 4 | กรอกข้อมูลด้วย keyboard | keyboard ไม่บัง form |

## UI-TC-002: Loading State
### Steps: คลิก Login → ตรวจสอบก่อน response กลับ
### Expected: ปุ่มแสดง loading spinner, disabled (ป้องกัน double submit)

## UI-TC-003: Error State แสดงถูกต้อง
### Steps: กรอก credentials ผิด → Submit
### Expected: Error message แสดงด้านบน form หรือใต้ field, text สีแดง
```

---

## Step 4: Test Suite Organization

```markdown
# Test Suite: Authentication Module
Total: 15 test cases | High: 8 | Medium: 5 | Low: 2

## Group 1: Login (TC-001 ถึง TC-010)
- TC-001: Login สำเร็จ — User ปกติ [High]
- TC-002: Login สำเร็จ — Admin redirect [High]
- TC-003: Login — Password ผิด [High]
- TC-004: Login — Email ไม่มีในระบบ [High]
- TC-005: Login — Email ยังไม่ verified [High]
- TC-006: Login — Password 7 ตัว [Medium]
- TC-007: Login — Password 8 ตัว [Medium]
- TC-008: Login — Email format ผิด [Medium]
- TC-009: Login — Fields ว่าง [Medium]
- TC-010: Login — Double submit prevention [Low]

## Group 2: API Tests (API-TC-001 ถึง API-TC-005)
- API-TC-001: POST /api/auth/login 200 [High]
- API-TC-002: POST /api/auth/login 401 [High]
- API-TC-003: POST /api/auth/login 400 validation [High]
- API-TC-004: GET /api/users no token 401 [High]
- API-TC-005: GET /api/users user role 403 [Medium]
```

---

## Checklist ก่อนส่งให้ทีม

- [ ] ทุก Acceptance Criteria มี Test Case รองรับ
- [ ] ทุก feature มีทั้ง Positive, Negative, Boundary cases
- [ ] API Test Cases ระบุ Request/Response schema ชัดเจน
- [ ] UI Test Cases ครอบคลุม mobile/tablet/desktop
- [ ] Priority กำหนดทุก test case
- [ ] Preconditions ระบุครบ (test data ที่ต้องเตรียม)
- [ ] Test Cases เรียงลำดับและ group อย่างมีระบบ
