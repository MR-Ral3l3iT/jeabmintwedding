---
name: bug-reporting
description: Task Skill สำหรับการเขียน Bug Report ใช้ทุกครั้งที่ต้องรายงาน bug, defect, หรือปัญหาที่พบในระบบ Web Application ให้ครบถ้วนและ reproduce ได้ ใช้ skill นี้เมื่อผู้ใช้พูดถึงการรายงาน bug, พบปัญหาในระบบ, เขียน defect report, หรือต้องการ document ปัญหาที่พบระหว่างทดสอบ
---

# Task: Bug Reporting

งานนี้ใช้ร่วมกับ Role: **QA Tester**
อ้างอิง: `/standards/documentation-standard.md`

---

## ขั้นตอนการทำงาน

```
Step 1: ระบุและ reproduce bug
        ↓
Step 2: กำหนด Severity และ Priority
        ↓
Step 3: เขียน Bug Report ให้ครบถ้วน
        ↓
Step 4: เก็บ Evidence (screenshot/video/log)
        ↓
Step 5: ส่ง Bug Report ให้ Developer
        ↓
Step 6: Verify fix เมื่อ Developer แก้ไขแล้ว
```

---

## Step 1: ก่อนเขียน Bug Report

ตรวจสอบก่อนเสมอ:
```
1. Reproduce ได้กี่ครั้ง? (1/3, 2/3, 3/3)
2. เกิดเฉพาะ environment ไหน? (dev/staging/production)
3. เกิดเฉพาะ browser หรือทุก browser?
4. เกิดเฉพาะ user บางคนหรือทุก user?
5. Bug นี้มีรายงานไปแล้วหรือยัง? (ตรวจสอบ duplicate)
```

---

## Step 2: Severity Matrix

### Severity (ความรุนแรงของ Bug)
| Level | นิยาม | ตัวอย่าง |
|-------|-------|---------|
| **S1 - Critical** | ระบบ crash / ข้อมูลสูญหาย / Security vulnerability | Login ไม่ได้ทั้งระบบ, SQL injection, data loss |
| **S2 - High** | Feature หลักใช้งานไม่ได้ ไม่มี workaround | สร้าง Order ไม่ได้, Payment error |
| **S3 - Medium** | Feature ทำงานได้บางส่วน หรือมี workaround | Pagination ผิด, Filter ไม่ทำงาน |
| **S4 - Low** | UI/UX เล็กน้อย ไม่กระทบการใช้งาน | ตัวอักษรผิด, icon ไม่ตรง, สี off |

### Priority (ความเร่งด่วนในการแก้)
| Level | นิยาม |
|-------|-------|
| **P1 - Immediate** | ต้องแก้ภายใน 24 ชม. |
| **P2 - High** | ต้องแก้ใน Sprint ปัจจุบัน |
| **P3 - Medium** | แก้ใน Sprint ถัดไป |
| **P4 - Low** | แก้เมื่อมีเวลา |

---

## Step 3: Bug Report Template มาตรฐาน

```markdown
# BUG-[XXX]: [ชื่อปัญหา — กระชับ ชัดเจน action + symptom]

## ข้อมูลทั่วไป

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-042 |
| **Severity** | S2 - High |
| **Priority** | P2 - High |
| **Status** | New |
| **รายงานโดย** | [ชื่อ QA] |
| **วันที่พบ** | DD/MM/YYYY HH:MM |
| **Assigned to** | - (รอ assign) |
| **Environment** | Staging |
| **URL** | https://staging.example.com/dashboard/users |
| **Browser/OS** | Chrome 124.0 / macOS Sonoma |
| **Reproduce Rate** | 3/3 (100%) |

---

## 📋 คำอธิบายปัญหา
[อธิบาย 1-2 ประโยค ว่าเกิดอะไรขึ้น ที่ไหน ผลกระทบคืออะไร]

ตัวอย่าง: เมื่อ Admin สร้าง user ใหม่ด้วย email ที่มีตัวพิมพ์ใหญ่ (เช่น TEST@EXAMPLE.COM)
ระบบสร้าง user ซ้ำกับ email เดิมได้โดยไม่แสดง error ส่งผลให้มี user account ซ้ำในระบบ

---

## 🔁 Steps to Reproduce
1. Login ด้วย admin: admin@example.com / Admin@1234
2. ไปที่ /dashboard/users
3. คลิกปุ่ม "+ เพิ่มผู้ใช้"
4. กรอก:
   - Name: ทดสอบ ซ้ำ
   - Email: **TEST@EXAMPLE.COM** (ตัวพิมพ์ใหญ่)
   - Password: Test@1234
5. คลิก "บันทึก"

---

## ✅ Expected Result
ระบบแสดง error **"อีเมลนี้ถูกใช้งานแล้ว"**
และไม่สร้าง user ใหม่ (HTTP 409 Conflict)

---

## ❌ Actual Result
ระบบสร้าง user ใหม่ได้สำเร็จ (HTTP 201)
ทำให้มี user 2 คนที่มี email เหมือนกันต่างแค่ case:
- test@example.com
- TEST@EXAMPLE.COM

---

## 📸 Evidence
- **Screenshot**: [แนบไฟล์] users-duplicate-bug.png
- **Network Log**: POST /api/users → 201 Created (ควรเป็น 409)
- **Console**: ไม่มี error

---

## 🔍 Root Cause Analysis (ถ้าทราบ)
Service ไม่ได้ normalize email เป็น lowercase ก่อน query ตรวจสอบ
ทำให้ PostgreSQL case-sensitive ค้นหาไม่เจอ email เดิม

---

## 💡 Suggested Fix
ใน `users.service.ts` → `create()`:
เพิ่ม `dto.email.toLowerCase()` ก่อน findUnique และ create

---

## 📎 Related
- User Story: US-001 (สมัครสมาชิก)
- Test Case: TC-XXX
- Commit ที่เกี่ยวข้อง: abc1234
```

---

## Step 4: Evidence Checklist

```markdown
## Evidence ที่ควรเก็บตาม Bug ประเภทต่างๆ

### UI Bug
- [ ] Screenshot แสดงปัญหาชัดเจน (annotate ถ้าจำเป็น)
- [ ] Browser/OS/Screen size
- [ ] Screen recording ถ้าปัญหาเป็น animation/transition

### API Bug
- [ ] Screenshot จาก Network tab (Request + Response)
- [ ] Request payload ที่ทำให้เกิด bug
- [ ] Response body และ status code ที่ได้
- [ ] Postman/Swagger collection (ถ้ามี)

### Data Bug
- [ ] Database state ก่อนและหลัง
- [ ] User account ที่ reproduce ได้

### Performance Bug
- [ ] Screenshot จาก DevTools Performance/Network tab
- [ ] Response time ที่วัดได้
```

---

## Step 5: Bug Severity Examples

```markdown
## S1 - Critical Examples
- BUG-001: ระบบ Login ล่ม ไม่สามารถเข้าสู่ระบบได้
- BUG-002: ลบ Order แล้วข้อมูล User หายด้วย (Data loss)
- BUG-003: API ส่งข้อมูล user อื่นกลับมา (Security)
- BUG-004: SQL Error แสดงบนหน้าจอ user (Information disclosure)

## S2 - High Examples
- BUG-010: ไม่สามารถสร้าง Order ได้ — 500 Internal Error
- BUG-011: ปุ่ม Save ใน Edit User ไม่ทำงาน
- BUG-012: Pagination แสดงหน้าที่ 2 แต่ข้อมูลยังเป็นหน้า 1
- BUG-013: Search ไม่ค้นหาข้อมูลภาษาไทย

## S3 - Medium Examples
- BUG-020: Filter ตาม Role ไม่ทำงานเมื่อเลือก "ADMIN"
- BUG-021: Modal ปิดเองหลัง 30 วินาทีโดยไม่มี action
- BUG-022: Toast notification ซ้อนทับกัน

## S4 - Low Examples
- BUG-030: ตัวอักษรผิด "ยืนยัน" แสดงเป็น "ยืนยัน"
- BUG-031: Icon ขนาดไม่สม่ำเสมอในหน้า Dashboard
- BUG-032: Hover state บน button ช้ากว่า 300ms
```

---

## Step 6: Verify Fix Checklist

เมื่อ Developer แจ้งว่าแก้ไขแล้ว:

```markdown
## Verify Checklist: BUG-[XXX]

### ข้อมูล Fix
- Fix Version: v1.2.3
- Commit: abc1234
- Deploy to: Staging วันที่ DD/MM/YYYY

### การ Verify
- [ ] Reproduce ตาม Steps เดิม → ไม่เกิด bug แล้ว
- [ ] ทดสอบ related scenarios (ไม่ให้ fix ทำให้ bug อื่นเกิด)
- [ ] ทดสอบ boundary cases ที่เกี่ยวข้อง
- [ ] ทดสอบบน browser ที่พบ bug
- [ ] ทดสอบบน browser อื่นด้วย (ถ้า applicable)

### ผลการ Verify
[ ] Fixed — ปิด bug ได้
[ ] Not Fixed — ยังเกิดอยู่ → Reopen พร้อมหลักฐาน
[ ] Partially Fixed — แก้บางส่วน → เขียน comment อธิบาย
```

---

## Checklist ก่อนส่ง Bug Report

- [ ] ชื่อ bug กระชับ ชัดเจน (action + symptom)
- [ ] Steps to Reproduce ทำตามได้จริง ไม่ต้องเดา
- [ ] Expected vs Actual result ชัดเจน ต่างกัน
- [ ] Severity กำหนดถูกต้อง
- [ ] Evidence แนบครบ (screenshot/log)
- [ ] Environment ระบุครบ (URL, browser, OS)
- [ ] Reproduce rate บันทึกไว้
- [ ] ตรวจสอบ duplicate ก่อน submit
