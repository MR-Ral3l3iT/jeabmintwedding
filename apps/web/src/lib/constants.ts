export const WEDDING = {
  groomName: 'ปิติสันห์ อินทพิชัย',
  groomNickname: 'มิ้นท์',
  brideName: 'นิรมล เจตเพ็ญภาส',
  brideNickname: 'เจี๊ยบ',
  date: new Date('2026-10-31T14:00:00+07:00'),
  venue: 'ณ อาคารอเนกประสงค์',
  city: 'กรมยุทธบริการทหาร, กรุงเทพฯ',
  promptpay: '081-234-5678', // TODO: เปลี่ยนเป็นเบอร์จริงก่อน go live
  promptpayName: 'นิรมล เจตเพ็ญภาส',
  lineOaId: '@528nhzxv',
  lineOaUrl: 'https://line.me/R/ti/p/@528nhzxv',
  rsvpContactPhone: '0655496538',
  mapsUrl: 'https://maps.app.goo.gl/MuHkXeetp6Ac5zGu9',
  rsvpDeadline: new Date('2026-10-14'),
  rsvpNote: [
    'เพื่อความสะดวกในการจัดเตรียมงาน',
    'กรุณาตอบรับการเข้าร่วมและฝากคำอวยพรให้แก่เราด้วยนะคะ',
    'ขอบคุณที่ร่วมเป็นส่วนหนึ่งในวันสำคัญของเราค่ะ',
  ],
  monogram: 'NP',
  timeline: [
    { time: '14:00', event: 'พิธีแห่ขันหมาก' },
    { time: '15:30', event: 'พิธีหลั่งน้ำพระพุทธมนต์' },
    { time: '18:30', event: 'พิธีฉลองมงคลสมรส' },
  ],
  palette: [
    { hex: '#5D3A26', name: 'Warm Mocha' },
    { hex: '#B8815B', name: 'Soft Copper' },
    { hex: '#947B68', name: 'Warm Taupe' },
    { hex: '#E6E2D3', name: 'Soft Cream' },
    { hex: '#73805D', name: 'Olive Forest' },
  ],
  guestManual: [
    {
      icon: 'clock',
      title: 'มาก่อนเวลา',
      desc: 'กรุณามาถึงก่อนพิธี เพื่อความพร้อมในการเริ่มงาน',
    },
    {
      icon: 'shirt',
      title: 'แต่งกายสุภาพ',
      desc: 'ขอความกรุณาแต่งกายด้วยชุดสุภาพโทนสีของงาน เพื่อความสวยงามในภาพรวม',
      showPalette: true,
    },
    {
      icon: 'smartphone',
      title: 'ร่วมเป็นส่วนหนึ่งของความทรงจำ',
      desc: 'แชร์ช่วงเวลาแห่งความสุขของเราได้เลย',
      hashtag: '#JeabandMintWedding',
    },
    {
      icon: 'gift',
      title: 'ของขวัญ',
      desc: 'การมาร่วมแสดงความยินดีของทุกท่าน เป็นของขวัญที่ดีที่สุดสำหรับเรา',
    },
  ],
} as const;

export const ASSETS = {
  envelopeTexture: '/assets/envelope-bg.png?v=3',
  cardTexture: '/assets/card-bg.png?v=3',
  goldStamp: '/assets/stamp.png?v=3',
  goldFoil: '/assets/gold-foil.png',
  logo: '/assets/logo.svg',
  coupleName: '/assets/name.svg',
  flowers: {
    f01: '/assets/flower/flower-01.png',
    f02: '/assets/flower/flower-02.png',
    f03: '/assets/flower/flower-03.png',
    f04: '/assets/flower/flower-04.png',
    f05: '/assets/flower/flower-05.png',
    f06: '/assets/flower/flower-06.png',
  },
  /** ผีเสื้อ — วาง PNG ที่เพื่อนวาดใน public/assets/butterfly/ แล้วเปลี่ยน USE_CUSTOM_BUTTERFLY_ART เป็น true */
  butterflies: {
    b01: '/assets/butterfly/butterfly-01.png',
    b02: '/assets/butterfly/butterfly-02.png',
    b03: '/assets/butterfly/butterfly-03.png',
  },
} as const;

/** เปิดเมื่อมีรูปผีเสื้อจากเพื่อนแล้ว — false = ใช้ SVG placeholder */
export const USE_CUSTOM_BUTTERFLY_ART = false;

/** สีพื้นผิวซอง — ใช้ร่วมกับ EnvelopeSurface */
export const ENVELOPE_COLOR = '#234148';

/** พื้นหลัง hero / loading — ใช้ค่าเดียวกันป้องกันกระพริบตอนเปลี่ยนหน้า */
export const HERO_GRADIENT =
  'linear-gradient(160deg, #EDF2E8 0%, #F8F5EE 60%, #E8EFE0 100%)';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Prefer current browser origin in production admin/client; fall back to build-time SITE_URL. */
function getSiteOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return SITE_URL;
}

export function getInviteUrl(token: string): string {
  return `${getSiteOrigin()}/invite/${token}`;
}

/** หน้ากลางลงทะเบียนชื่อเรียก + ฝั่ง — มี token = อัปเดตแขก / ไม่มี = ออฟไลน์สร้างใหม่ */
export function getJoinUrl(token?: string): string {
  const origin = getSiteOrigin();
  return token ? `${origin}/join/${token}` : `${origin}/join`;
}

/** Site URL with token in path — reliable for phone camera QR scans */
export function getLiffLinkUrl(inviteToken: string): string | null {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID?.trim();
  if (!liffId) return null;
  const origin = getSiteOrigin();
  return `${origin}/liff/link/${encodeURIComponent(inviteToken)}`;
}

/** Open inside LINE app (also keeps token in path after Endpoint handoff) */
export function getLiffLineMeUrl(inviteToken: string): string | null {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID?.trim();
  if (!liffId) return null;
  return `https://liff.line.me/${liffId}/${encodeURIComponent(inviteToken)}`;
}
