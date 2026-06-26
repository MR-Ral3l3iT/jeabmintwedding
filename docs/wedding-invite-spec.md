# Wedding Invitation Web App — Project Spec
> Jeab & Mint · 31 ตุลาคม 2569

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (App Router, TypeScript) |
| Styling | Tailwind CSS + Lucide Icons |
| Backend | NestJS (REST API) |
| Database | PostgreSQL + Prisma ORM |
| Auth (Admin) | NestJS JWT / NextAuth.js (credentials) |

---

## Project Structure

```
root/
├── apps/
│   ├── web/          # Next.js frontend (public invite + admin dashboard)
│   └── api/          # NestJS backend
├── packages/
│   └── prisma/       # Shared Prisma schema + migrations
└── docker-compose.yml
```

---

## Database Schema (Prisma)

```prisma
model Guest {
  id          String   @id @default(cuid())
  name        String
  attending   Boolean
  lineUserId  String?  // ถ้าเชื่อม LINE OA ในอนาคต
  createdAt   DateTime @default(now())

  wish        Wish?
}

model Wish {
  id        String   @id @default(cuid())
  message   String   @db.Text
  guestId   String   @unique
  guest     Guest    @relation(fields: [guestId], references: [id])
  createdAt DateTime @default(now())
}

model Admin {
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
}
```

---

## Pages & Routes

### Public (Next.js)

| Route | Description |
|---|---|
| `/` | หน้า Invitation หลัก (envelope animation, countdown, venue, RSVP) |
| `/rsvp` | หน้า RSVP form (ถ้าแยกออกมา) |
| `/admin/login` | หน้า Login สำหรับเจ้าบ่าว-เจ้าสาว |
| `/admin` | Dashboard หลังบ้าน (redirect ถ้าไม่ได้ login) |
| `/admin/guests` | รายชื่อแขกทั้งหมด + filter |
| `/admin/wishes` | การ์ดอวยพรทั้งหมด |

### API (NestJS)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/rsvp` | บันทึกการตอบรับ + คำอวยพร | Public |
| GET | `/admin/guests` | รายชื่อแขกทั้งหมด | Admin JWT |
| GET | `/admin/guests/stats` | สรุปจำนวน attending/declined | Admin JWT |
| GET | `/admin/wishes` | การ์ดอวยพรทั้งหมด | Admin JWT |
| POST | `/auth/login` | Admin login → JWT | Public |

---

## Feature Breakdown

### 1. หน้า Invitation (Public `/`)

**UI Sections (เรียงจากบน):**
1. **Loading Screen** — monogram "NP" + loading bar โทน teal/gold
2. **Hero — Envelope Animation**
   - ซองจดหมาย พร้อม wax seal "NP"
   - แตะ/คลิก → ฝาซองเปิด (CSS 3D flip) → การ์ดโผล่ขึ้น
   - แสดงชื่อ "Jeab & Mint" + วันที่
3. **Quote** — มัทธิว 19:6 (full-width dark teal bg)
4. **Countdown** — real-time นับถอยหลังไป 31 ต.ค. 2569 เวลา 14:00 น.
5. **Venue & Timeline**
   - 14:00 พิธีรับขวัญเนา
   - 15:30 พิธีมอบน้ำพระพุทธมนต์
   - 18:30 งานเลี้ยงฉลองมงคลสมรส
   - ปุ่ม "ดูเส้นทาง" → Google Maps
6. **Dress Code** — color swatches (Mocha, Copper, Forest, Teal, Dark Teal) + คำอธิบาย
7. **Guest Manual** — 4 cards (มาก่อนเวลา, ห้ามชุดขาว, เพลิดเพลิน, อย่าขวางช่าง)
8. **RSVP Section** — ปุ่มเปิด Modal

**Color Palette:**
```
--sage:       #6B7C5E
--teal-dark:  #1E3A3A
--cream:      #FAF7F2
--gold:       #C8A96E
```

**Fonts:** Great Vibes (script), Cormorant Garamond (serif), Sarabun (Thai body)

---

### 2. RSVP Modal Flow

```
เปิด Modal
    │
    ▼
[Step 1] กรอกชื่อ → เลือก "เข้าร่วม" หรือ "ไม่สะดวก"
    │                           │
    ▼                           ▼
[Step 2A] ATTENDING         [Step 2B] NOT ATTENDING
─────────────────────       ────────────────────────
แสดง LINE OA guide:         Tab 1: 💌 การ์ดอวยพร
• LINE ID copy button         → textarea (max 300 chars)
• ปุ่ม "เพิ่มเพื่อนใน LINE"    → POST /rsvp { attending: false, wish }
  (deep link)               Tab 2: 💸 ช่วยงาน
• ข้อความต้อนรับ              → แสดง PromptPay QR image
                              → ปุ่ม copy เบอร์ PromptPay
```

**API Call เมื่อกด confirm:**
```typescript
POST /rsvp
Body: {
  name: string
  attending: boolean
  wish?: string      // optional, เฉพาะคนที่ไม่มา
}
```

---

### 3. LINE OA Integration

> ยังไม่มี LINE OA — ต้องสร้างก่อน

**วิธีสร้าง LINE OA (5 นาที):**
1. ไปที่ [manager.line.biz](https://manager.line.biz)
2. Login ด้วย LINE ส่วนตัว → สร้างบัญชี "Jeab & Mint Wedding"
3. ไปที่ ข้อมูลบัญชี → คัดลอก LINE ID (เช่น `@jeabmint2569`)
4. ตั้ง Welcome Message: "ขอบคุณที่เพิ่มเพื่อนนะคะ 💚 รับอัปเดตงานแต่งและเกมสนุกๆ ได้ที่นี่!"
5. แผน Free: Broadcast 200 ข้อความ/เดือน (เพียงพอ)

**Deep Link สำหรับใส่ในเว็บ:**
```
https://line.me/R/ti/p/@YOUR_LINE_OA_ID
```

**Future:** ถ้าต้องการ Webhook (รับ event เมื่อแขกเพิ่มเพื่อน) → ใช้ [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/)

---

### 4. PromptPay

- แสดง QR Image (generate จากแอปธนาคาร แล้ว export เป็น PNG/SVG)
- แสดงเบอร์โทร + ชื่อบัญชี
- ปุ่ม "คัดลอกเบอร์" → `navigator.clipboard.writeText()`

**วิธีได้ QR จริง:** เปิดแอปธนาคาร → รับเงิน/พร้อมเพย์ → บันทึก QR → นำ image มาใส่ใน `/public/promptpay-qr.png`

---

### 5. Admin Dashboard (`/admin`)

**Auth Flow:**
- NestJS ออก JWT เมื่อ login สำเร็จ
- Next.js เก็บ token ใน httpOnly cookie
- Middleware protect ทุก route `/admin/*`

**Dashboard หน้าหลัก (`/admin`):**
```
┌─────────────────────────────────────────┐
│  Jeab & Mint — Admin Dashboard          │
├──────────┬──────────┬───────────────────┤
│  ✅ มางาน │ ❌ ไม่มา │  💌 การ์ดอวยพร   │
│    xx คน │   xx คน  │      xx ใบ        │
└──────────┴──────────┴───────────────────┘
```

**หน้า Guests (`/admin/guests`):**
- ตาราง: ชื่อ | สถานะ (เข้าร่วม/ไม่มา) | วันที่ตอบ
- Filter: ทั้งหมด / เข้าร่วม / ไม่สะดวก
- Search by name
- Export CSV (ถ้าต้องการ)

**หน้า Wishes (`/admin/wishes`):**
- Cards แสดงทีละใบ: ชื่อแขก + ข้อความ + วันที่
- เรียงล่าสุดขึ้นก่อน

---

## NestJS Module Structure

```
api/src/
├── app.module.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts    # POST /auth/login
│   ├── auth.service.ts       # validateAdmin, generateJWT
│   └── jwt.strategy.ts
├── rsvp/
│   ├── rsvp.module.ts
│   ├── rsvp.controller.ts    # POST /rsvp (public)
│   ├── rsvp.service.ts       # createGuest + createWish
│   └── rsvp.dto.ts
└── admin/
    ├── admin.module.ts
    ├── admin.controller.ts   # GET /admin/guests, /admin/wishes, /admin/guests/stats
    └── admin.service.ts
```

---

## Next.js App Structure

```
web/src/
├── app/
│   ├── page.tsx              # Public invite page
│   ├── layout.tsx
│   ├── admin/
│   │   ├── layout.tsx        # Auth guard wrapper
│   │   ├── login/page.tsx
│   │   ├── page.tsx          # Dashboard (stats)
│   │   ├── guests/page.tsx
│   │   └── wishes/page.tsx
│   └── api/
│       └── auth/[...nextauth]/route.ts  # ถ้าใช้ NextAuth
├── components/
│   ├── invite/
│   │   ├── EnvelopeHero.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── VenueSection.tsx
│   │   ├── DressCode.tsx
│   │   └── RsvpModal.tsx
│   ├── rsvp/
│   │   ├── StepOne.tsx           # ชื่อ + เลือก attending
│   │   ├── StepAttending.tsx     # LINE OA guide
│   │   └── StepDeclined.tsx      # Wish + PromptPay tabs
│   └── admin/
│       ├── StatsCards.tsx
│       ├── GuestTable.tsx
│       └── WishCard.tsx
├── lib/
│   ├── api.ts                # fetch wrapper → NestJS
│   └── countdown.ts          # countdown hook
└── middleware.ts             # protect /admin routes
```

---

## Environment Variables

```env
# apps/api/.env
DATABASE_URL="postgresql://user:pass@localhost:5432/wedding"
JWT_SECRET="your-secret-here"
ADMIN_EMAIL="jeab@example.com"
ADMIN_PASSWORD_HASH="bcrypt hash"

# apps/web/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-nextauth-secret"
```

---

## Local PostgreSQL (dev)

ใช้ PostgreSQL บนเครื่อง (เช่น [Postgres.app](https://postgresapp.com/)) แทน Docker — ประหยัดพื้นที่และไม่ชนพอร์ต 5432

```bash
# ครั้งแรก: สร้าง user + database
psql -h localhost -U $USER -d postgres -f scripts/setup-local-db.sql

# migrate + seed
npm run prisma:migrate:dev
npm run prisma:seed
```

`DATABASE_URL` ใน `packages/prisma/.env` และ `apps/api/.env`:

```env
DATABASE_URL="postgresql://wedding:wedding@localhost:5432/wedding"
```

`docker-compose.yml` ยังมีไว้สำหรับรัน API/Web ใน container (optional) โดยชี้ DB ไปที่ `host.docker.internal`

---

## Seed Data (Prisma)

```typescript
// packages/prisma/seed.ts
await prisma.admin.create({
  data: {
    email: 'admin@jeabmint.com',
    passwordHash: await bcrypt.hash('your-password', 10),
  },
});
```

---

## Key Implementation Notes

### Countdown Timer (React Hook)
```typescript
// lib/countdown.ts
export function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}
```

### RSVP DTO (NestJS)
```typescript
// rsvp/rsvp.dto.ts
export class CreateRsvpDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsBoolean()
  attending: boolean;

  @IsString() @IsOptional() @MaxLength(300)
  wish?: string;
}
```

### Protect Admin Routes (Next.js Middleware)
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('admin-token');
  if (req.nextUrl.pathname.startsWith('/admin') &&
      !req.nextUrl.pathname.startsWith('/admin/login') &&
      !token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
}
export const config = { matcher: ['/admin/:path*'] };
```

---

## Design Tokens (Tailwind Config)

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      sage:      '#6B7C5E',
      'sage-light': '#8E9E80',
      'sage-pale':  '#D4DDC8',
      'teal-dark':  '#1E3A3A',
      cream:     '#FAF7F2',
      gold:      '#C8A96E',
      'gold-light': '#E8D5A3',
    },
    fontFamily: {
      display: ['"Great Vibes"', 'cursive'],
      serif:   ['"Cormorant Garamond"', 'serif'],
      thai:    ['Sarabun', 'sans-serif'],
    },
  },
}
```

---

## Wedding Info (ใส่ใน constants)

```typescript
// lib/constants.ts
export const WEDDING = {
  groomName:   'ปิติสันห์ อันทพิชัย (มิ้นท์)',
  brideName:   'นิยมรณา เอกเพ็ญกาศ (เจี๊ยบ)',
  date:        new Date('2026-10-31T14:00:00+07:00'),
  venue:       'ณ ลาภาอมรประสงค์',
  city:        'กรุงเทพมหานคร',
  promptpay:   '08XXXXXXXXX',  // ← ใส่เบอร์จริง
  lineOaId:    '@XXXXXXX',     // ← ใส่หลังสร้าง LINE OA
  rsvpDeadline: new Date('2026-10-15'),
  timeline: [
    { time: '14:00', event: 'พิธีรับขวัญเนา' },
    { time: '15:30', event: 'พิธีมอบน้ำพระพุทธมนต์' },
    { time: '18:30', event: 'งานเลี้ยงฉลองมงคลสมรส' },
  ],
  palette: [
    { hex: '#5C3D2E', name: 'Mocha' },
    { hex: '#7B4F3A', name: 'Copper' },
    { hex: '#4A5C3F', name: 'Forest' },
    { hex: '#2C3E30', name: 'Teal' },
    { hex: '#1E3A3A', name: 'Dark Teal' },
  ],
};
```

---

## Checklist ก่อน Go Live

- [ ] สร้าง LINE OA และอัปเดต `lineOaId`
- [ ] ได้ PromptPay QR จากแอปธนาคาร → วางใน `/public/promptpay-qr.png`
- [ ] อัปเดตเบอร์ PromptPay และชื่อบัญชีจริง
- [ ] ตั้ง `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` ใน `.env`
- [ ] ใส่ Google Maps link จริงของสถานที่
- [ ] ตรวจสอบชื่อเต็มบ่าวสาว
- [ ] Test RSVP flow บนมือถือ
- [ ] Deploy (Vercel สำหรับ Next.js, Railway/Render สำหรับ NestJS + Postgres)
