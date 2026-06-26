---
name: requirements-gathering
description: Task Skill สำหรับการรวบรวมและวิเคราะห์ความต้องการ (Requirement Gathering) ใช้ทุกครั้งที่ต้องสัมภาษณ์ stakeholder, วิเคราะห์ความต้องการ, จัดกลุ่ม requirements, เขียน User Stories พร้อม Acceptance Criteria หรือสร้าง Requirement Document ใช้ skill นี้เมื่อผู้ใช้พูดถึงการเก็บ requirement, วิเคราะห์ความต้องการ, เขียน user story, หรือเริ่มต้นโปรเจกต์ใหม่
---

# Task: Requirements Gathering

งานนี้ใช้ร่วมกับ Role: **System Analyst**
อ้างอิง: `/standards/documentation-standard.md`

---

## ขั้นตอนการทำงาน

```
Step 1: เตรียมคำถามสัมภาษณ์
        ↓
Step 2: สัมภาษณ์ Stakeholder
        ↓
Step 3: จัดกลุ่มและวิเคราะห์ Requirements
        ↓
Step 4: เขียน User Stories + Acceptance Criteria
        ↓
Step 5: Validate กับ Stakeholder
        ↓
Step 6: สร้าง Requirement Document
```

---

## Step 1: คำถามสัมภาษณ์ Stakeholder

### คำถามระดับ Business
```
1. ระบบนี้แก้ปัญหาอะไร? ปัจจุบันทำอย่างไร?
2. ใครคือผู้ใช้งานหลัก? แบ่งกลุ่มได้อย่างไร?
3. ผลลัพธ์ที่ต้องการคืออะไร? วัดความสำเร็จอย่างไร?
4. มี deadline หรือ milestone ที่กำหนดไว้?
5. งบประมาณและ resource มีข้อจำกัดอะไร?
```

### คำถามระดับ System
```
6. มีระบบเดิมที่ต้องเชื่อมต่อหรือ migrate ข้อมูล?
7. มี role / permission ที่แตกต่างกันอย่างไร?
8. ข้อมูลอะไรบ้างที่ระบบต้องเก็บ?
9. มี integration กับ third-party service ไหม? (payment, email, SMS)
10. มีข้อกำหนดด้าน security หรือ compliance พิเศษ? (PDPA, ISO)
```

### คำถาม Edge Cases
```
11. เกิดอะไรขึ้นถ้า [action X] ล้มเหลว?
12. ระบบต้องรองรับผู้ใช้พร้อมกันกี่คน?
13. ข้อมูลเก่าจะจัดการอย่างไร? ลบหรือ archive?
14. มีช่วงเวลาที่ใช้งานหนักเป็นพิเศษ? (peak hours)
```

---

## Step 2: การจัดกลุ่ม Requirements

### Functional Requirements (FR)
สิ่งที่ระบบต้องทำได้ — ตั้งเลข FR-XXX:
```markdown
| ID | Description | Priority | Source |
|----|-------------|----------|--------|
| FR-001 | ผู้ใช้สามารถสมัครสมาชิกด้วยอีเมล | High | Stakeholder A |
| FR-002 | ระบบส่ง verification email หลังสมัคร | High | Stakeholder A |
| FR-003 | ผู้ใช้ login ด้วยอีเมล + รหัสผ่าน | High | Stakeholder A |
| FR-004 | Admin จัดการผู้ใช้ได้ (CRUD) | Medium | Stakeholder B |
```

### Non-Functional Requirements (NFR)
คุณสมบัติด้านคุณภาพ — ต้องระบุตัวเลขที่วัดได้:
```markdown
| ID | Category | Description | Metric |
|----|----------|-------------|--------|
| NFR-001 | Performance | Response time | < 200ms สำหรับ 95% ของ requests |
| NFR-002 | Scalability | Concurrent users | รองรับ 500 users พร้อมกัน |
| NFR-003 | Availability | Uptime | 99.9% (downtime < 8.7 ชม./ปี) |
| NFR-004 | Security | Authentication | JWT + refresh token |
| NFR-005 | Compliance | ข้อมูลส่วนบุคคล | PDPA compliant |
```

### Constraints (ข้อจำกัด)
```markdown
| ประเภท | รายละเอียด |
|--------|-----------|
| เวลา | ต้อง launch ภายใน 3 เดือน |
| Tech Stack | ต้องใช้ NestJS + Next.js + PostgreSQL |
| Budget | -  |
| Team | Frontend 2 คน, Backend 2 คน |
```

---

## Step 3: User Story Template

### รูปแบบมาตรฐาน
```markdown
## [US-XXX]: [ชื่อ Feature]

**As a** [role]
**I want to** [action]
**So that** [business value]

**Priority:** High / Medium / Low
**Story Points:** 1 / 2 / 3 / 5 / 8 / 13
**Depends on:** [US-XXX] (ถ้ามี)
```

### Acceptance Criteria (Gherkin)
```gherkin
### Scenario 1: [Happy Path — กรณีสำเร็จ]
  Given [เงื่อนไขเริ่มต้น]
  When [action]
  Then [ผลลัพธ์ที่คาดหวัง]

### Scenario 2: [Error Case]
  Given [เงื่อนไขเริ่มต้น]
  When [action ที่ผิดพลาด]
  Then [error ที่ต้องแสดง]

### Scenario 3: [Edge Case]
  Given [เงื่อนไขพิเศษ]
  When [action]
  Then [ผลลัพธ์]
```

---

## Step 4: ตัวอย่าง User Stories สมบูรณ์

```markdown
## US-001: สมัครสมาชิก

**As a** ผู้เยี่ยมชมเว็บไซต์
**I want to** สมัครสมาชิกด้วยอีเมลและรหัสผ่าน
**So that** ฉันสามารถเข้าถึงฟีเจอร์ทั้งหมดได้

**Priority:** High | **Story Points:** 3

### Scenario 1: สมัครสำเร็จ
  Given ฉันอยู่หน้า /register
  When กรอก email ที่ valid และไม่ซ้ำ + password >= 8 ตัว
  And คลิก "สมัครสมาชิก"
  Then ระบบสร้างบัญชีใหม่
  And ส่ง verification email
  And redirect ไปหน้า "กรุณายืนยัน email"

### Scenario 2: Email ซ้ำในระบบ
  Given มี account ที่ใช้ email นี้แล้ว
  When กรอก email เดิม
  Then แสดง error "อีเมลนี้ถูกใช้งานแล้ว"
  And ไม่สร้าง account ใหม่

### Scenario 3: Password ไม่ผ่านเกณฑ์
  Given ฉันอยู่หน้า /register
  When กรอก password < 8 ตัว
  Then แสดง error "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
  And ปุ่ม submit ยัง disabled

### Scenario 4: Email format ผิด
  Given ฉันอยู่หน้า /register
  When กรอก email: "notanemail"
  Then แสดง error "รูปแบบอีเมลไม่ถูกต้อง" ทันที (client-side)
```

---

## Step 5: Requirement Document Output

```markdown
# Requirement Document: [ชื่อโปรเจกต์]
Version: 1.0 | วันที่: [DD/MM/YYYY]
เขียนโดย: [SA] | Approved by: [Stakeholder]

## 1. ภาพรวมโปรเจกต์
## 2. User Personas
## 3. Functional Requirements (FR-XXX)
## 4. Non-Functional Requirements (NFR-XXX)
## 5. Constraints
## 6. User Stories พร้อม Acceptance Criteria
## 7. Out of Scope
## 8. Open Issues / TBD
## 9. Revision History
```

---

## Checklist ก่อนส่งต่อ

- [ ] ทุก FR มี priority และ source
- [ ] ทุก NFR มีตัวเลขที่วัดได้
- [ ] ทุก User Story มี Acceptance Criteria ครบ 3 scenarios (happy/error/edge)
- [ ] ไม่มี requirement ที่ขัดแย้งกัน
- [ ] Out of scope ระบุชัดเจน
- [ ] Stakeholder review และ sign-off แล้ว
