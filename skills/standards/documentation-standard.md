---
name: documentation-standard
description: มาตรฐานการเขียน Documentation สำหรับทีมพัฒนา Web Application ที่ใช้ NestJS + Next.js TypeScript + PostgreSQL ใช้ทุกครั้งที่เขียน README, API doc, Code comment, Swagger, หรือ Technical spec ในโปรเจกต์นี้
---

# Documentation Standard
มาตรฐานการเขียน Documentation สำหรับ Web Application Stack: NestJS + Next.js (TypeScript) + PostgreSQL + Prisma + Swagger

---

## 1. README.md (ระดับ Project)

ทุกโปรเจกต์ต้องมี `README.md` ที่ครอบคลุมหัวข้อเหล่านี้:

```markdown
# [ชื่อโปรเจกต์]

## 📋 ภาพรวม (Overview)
อธิบายว่าระบบนี้ทำอะไร สำหรับใคร และแก้ปัญหาอะไร (2-3 ย่อหน้า)

## 🛠 Tech Stack
- **Backend**: NestJS, Node.js, TypeScript
- **Frontend**: Next.js, TypeScript, TailwindCSS, Lucide Icons
- **Database**: PostgreSQL, Prisma ORM
- **API Docs**: Swagger (OpenAPI)

## 📦 Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 15.x
- npm >= 9.x

## 🚀 การติดตั้งและรันโปรเจกต์

### 1. Clone โปรเจกต์
\`\`\`bash
git clone [repo-url]
cd [project-name]
\`\`\`

### 2. ติดตั้ง Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. ตั้งค่า Environment Variables
\`\`\`bash
cp .env.example .env
# แก้ไขค่าใน .env ให้ตรงกับ environment ของคุณ
\`\`\`

### 4. Setup Database
\`\`\`bash
npx prisma migrate dev
npx prisma db seed   # (ถ้ามี)
\`\`\`

### 5. รัน Development Server
\`\`\`bash
npm run dev
\`\`\`

## 🌐 Endpoints หลัก
| Service | URL |
|---------|-----|
| Backend API | http://localhost:3001 |
| Frontend | http://localhost:3000 |
| Swagger UI | http://localhost:3001/api/docs |

## 📁 โครงสร้างโปรเจกต์
[แสดง folder structure หลัก]

## 🧪 การรัน Tests
\`\`\`bash
npm run test          # unit tests
npm run test:e2e      # e2e tests
npm run test:cov      # coverage report
\`\`\`

## 👥 ทีมพัฒนา
[รายชื่อและ role]
```

---

## 2. API Documentation — Swagger

ทุก endpoint ต้องมี Swagger annotation ครบถ้วน

### Controller Level
```typescript
@ApiTags('Users')                           // หมวดหมู่ใน Swagger UI
@ApiBearerAuth()                            // ถ้าต้องการ JWT
@Controller('users')
export class UsersController { ... }
```

### Endpoint Level
```typescript
@Post()
@ApiOperation({
  summary: 'สร้างผู้ใช้ใหม่',
  description: 'สร้างผู้ใช้ใหม่ในระบบ ต้องการสิทธิ์ ADMIN เท่านั้น'
})
@ApiResponse({ status: 201, description: 'สร้างสำเร็จ', type: UserResponseDto })
@ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง' })
@ApiResponse({ status: 401, description: 'ไม่ได้รับอนุญาต' })
@ApiResponse({ status: 409, description: 'Email นี้ถูกใช้งานแล้ว' })
async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> { ... }
```

### DTO Level
```typescript
export class CreateUserDto {
  @ApiProperty({
    description: 'ชื่อ-นามสกุลผู้ใช้',
    example: 'สมชาย ใจดี',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'อีเมลสำหรับเข้าสู่ระบบ (ต้องไม่ซ้ำกัน)',
    example: 'somchai@example.com'
  })
  @IsEmail()
  email: string;
}
```

---

## 3. Code Comments

### หลักการ: Comment อธิบาย "ทำไม" ไม่ใช่ "ทำอะไร"
```typescript
// ❌ ผิด — อธิบายสิ่งที่โค้ดทำอยู่แล้ว
// วนลูปผ่าน users array
for (const user of users) { ... }

// ✅ ถูกต้อง — อธิบายเหตุผลหรือ business rule
// ส่ง email เฉพาะ user ที่ verified แล้วเท่านั้น
// ตาม policy ของบริษัทที่กำหนดใน spec หน้า 12
for (const user of users.filter(u => u.emailVerifiedAt)) { ... }
```

### JSDoc สำหรับ Public Functions
ทุก public method ใน Service ต้องมี JSDoc:

```typescript
/**
 * ดึงรายการผู้ใช้พร้อม pagination
 * @param page - หน้าที่ต้องการ (เริ่มจาก 1)
 * @param limit - จำนวนรายการต่อหน้า (max: 100)
 * @param search - คำค้นหา (ค้นจาก name และ email)
 * @returns รายการ users พร้อมข้อมูล pagination
 * @throws {BadRequestException} เมื่อ limit เกิน 100
 */
async findAll(page: number, limit: number, search?: string): Promise<PaginatedResult<UserResponseDto>> { ... }
```

### TODO / FIXME Comments
```typescript
// TODO: [ชื่อ] [วันที่] — เพิ่ม caching ด้วย Redis เมื่อ traffic สูงขึ้น
// FIXME: [ชื่อ] [วันที่] — แก้ไข edge case เมื่อ user ไม่มี profile
// HACK: [ชื่อ] [วันที่] — workaround ชั่วคราว รอ library update เวอร์ชัน 2.x
// NOTE: business rule — ลบ order ได้เฉพาะสถานะ PENDING เท่านั้น
```

---

## 4. Prisma Schema Comments

```prisma
/// ตารางผู้ใช้งานระบบ
/// ใช้ cuid() เพื่อป้องกันการ enumerate IDs
model User {
  id    String @id @default(cuid())

  /// อีเมลต้องไม่ซ้ำกันทั้งระบบ ใช้สำหรับ login
  email String @unique

  /// เก็บเป็น bcrypt hash เสมอ ห้าม store plaintext
  password String

  /// null = ยังไม่ได้ verify email
  emailVerifiedAt DateTime?

  @@map("users")
}
```

---

## 5. Environment Variables (.env.example)

ทุกโปรเจกต์ต้องมีไฟล์ `.env.example` ที่มี comment อธิบายทุกตัวแปร:

```env
# =====================
# Application
# =====================
# Port ที่ backend รันอยู่
APP_PORT=3001

# URL ของ frontend สำหรับ CORS config
FRONTEND_URL=http://localhost:3000

# Environment: development | staging | production
NODE_ENV=development

# =====================
# Database
# =====================
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=postgresql://postgres:password@localhost:5432/mydb

# =====================
# Authentication
# =====================
# Secret key สำหรับ sign JWT (ควรยาวอย่างน้อย 32 characters)
JWT_SECRET=your-super-secret-key-change-this-in-production

# อายุของ access token (format: 15m, 1h, 7d)
JWT_EXPIRES_IN=15m

# Secret key สำหรับ refresh token (ต้องต่างจาก JWT_SECRET)
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production

# อายุของ refresh token
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 6. Git Commit Message

ใช้รูปแบบ **Conventional Commits**:

```
[type]([scope]): [short description ภาษาไทยหรืออังกฤษ]

[optional body — อธิบายรายละเอียดเพิ่มเติม]

[optional footer — เช่น Refs: #ticket-id]
```

### Types ที่ใช้
| Type | ใช้เมื่อ |
|------|---------|
| `feat` | เพิ่ม feature ใหม่ |
| `fix` | แก้ไข bug |
| `docs` | แก้ไข documentation เท่านั้น |
| `style` | แก้ไข format, whitespace (ไม่กระทบ logic) |
| `refactor` | ปรับโครงสร้างโค้ด (ไม่ใช่ bug fix หรือ feature) |
| `test` | เพิ่มหรือแก้ไข tests |
| `chore` | update dependencies, config files |
| `perf` | ปรับปรุง performance |
| `revert` | ย้อนกลับ commit ก่อนหน้า |

### ตัวอย่าง
```
feat(auth): เพิ่มระบบ refresh token

- เพิ่ม endpoint POST /api/auth/refresh-token
- เก็บ refresh token ใน httpOnly cookie
- ตั้งอายุ access token เป็น 15 นาที

Refs: #US-042

fix(users): แก้ไข pagination ไม่นับจำนวนรายการที่ถูกต้อง

docs(readme): เพิ่มขั้นตอนการ setup database

chore: อัปเดต @nestjs/* packages เป็นเวอร์ชัน 10.x
```

---

## 7. Pull Request Template

สร้างไฟล์ `.github/pull_request_template.md`:

```markdown
## 📌 ประเภทของการเปลี่ยนแปลง
- [ ] ✨ Feature ใหม่
- [ ] 🐛 Bug fix
- [ ] ♻️ Refactor
- [ ] 📝 Documentation
- [ ] 🧪 Tests
- [ ] 🔧 Configuration

## 📋 สรุปการเปลี่ยนแปลง
อธิบายสิ่งที่เปลี่ยนแปลงและเหตุผล

**Refs:** #[ticket-id]

## 🧪 วิธีการทดสอบ
1. ...
2. ...

## ✅ Checklist
- [ ] โค้ดผ่าน linting แล้ว (`npm run lint`)
- [ ] มี unit test ครอบคลุม business logic หลัก
- [ ] อัปเดต Swagger documentation แล้ว (ถ้ามี API เปลี่ยน)
- [ ] อัปเดต `.env.example` แล้ว (ถ้ามี env variable ใหม่)
- [ ] ไม่มี `console.log` หรือ debug code หลงเหลือ
- [ ] ไม่มี hardcoded credentials
```

---

## 8. Technical Specification (สำหรับ Feature ใหม่)

เมื่อ System Analyst เขียน spec ให้ใช้โครงสร้างนี้:

```markdown
# [Feature Name] — Technical Specification

## ภาพรวม
อธิบาย feature นี้ทำอะไร และ business value คืออะไร

## User Stories
- **As a** [role], **I want to** [action], **so that** [benefit]

## Functional Requirements
1. ระบบต้องสามารถ...
2. ผู้ใช้ต้องสามารถ...

## Non-Functional Requirements
- Performance: response time < 200ms สำหรับ 95% ของ requests
- Security: ต้องผ่าน authentication และ authorization
- Availability: uptime 99.9%

## API Design (เบื้องต้น)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/... | ... |

## Database Changes
- ตาราง/คอลัมน์ที่เพิ่ม/แก้ไข

## Acceptance Criteria
- [ ] เงื่อนไขที่ต้องผ่านเพื่อถือว่า feature สมบูรณ์
```
