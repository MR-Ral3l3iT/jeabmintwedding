import { messagingApi } from '@line/bot-sdk';

export type GuestMediaIntent = 'parking' | 'dress';

const PARKING_KEYWORDS = [
  'จอดรถ',
  'ที่จอด',
  'ที่จอดรถ',
  'parking',
  'รถกอล์ฟ',
  'รถกอลฟ',
  'แผนที่จอด',
  'จอดตรงไหน',
  'จอดที่ไหน',
];

const DRESS_KEYWORDS = [
  'ธีมสี',
  'โทนสี',
  'แต่งตัว',
  'แต่งกาย',
  'ชุดไปงาน',
  'ใส่สี',
  'dress code',
  'dresscode',
  'palette',
  'พาเลต',
  'พาเลท',
  'สีอะไร',
  'สีไหน',
];

/** ความรู้คงที่ส่งให้ Gemini ทุกครั้ง — ไม่พึ่ง Bot Studio อย่างเดียว */
export const PARKING_KNOWLEDGE = `ที่จอดรถ:
- ที่จอดรวมประมาณ 700 คัน
- เข้าจากถนนรัชดาภิเษก แล้วเข้าสู่พื้นที่จัดงาน
- จุดจอดหลักกระจายตามทางเข้าและลึกเข้าไปในพื้นที่ (ดูแผนที่รูปภาพ)
- จุดใกล้เวที/อาคาร: โดมประมาณ 20 คัน, หน้าอาคารประมาณ 11 คัน, ตรงข้ามอาคารประมาณ 15 คัน — อาจสงวนเป็นโซน VIP
- ตลอดงานมีรถกอล์ฟบริการรับส่งจากที่จอด
- ตอบสั้น ๆ แล้วบอกว่าส่งแผนที่ให้ดูด้วย`;

export const DRESS_KNOWLEDGE = `ธีมสีและแต่งกาย:
- ธีมงานเป็นโทนอุ่นเอิร์ธโทน
- สีหลัก: น้ำตาลเข้ม (#602E18), ส้มอิฐ (#C67E50), น้ำตาลอ่อน (#9F785A), ครีม (#E2DCBF), เขียวมะกอก (#6A804F)
- เลือกใส่สีใดสีหนึ่งหรือโทนใกล้เคียงได้ ไม่ต้องสีเดียวกันเป๊ะ
- แต่งกายสุภาพ
- ตอบสั้น ๆ แล้วบอกว่าส่งภาพธีมสีให้ดูด้วย`;

function normalize(text: string): string {
  return text.toLowerCase();
}

export function detectGuestMediaIntents(text: string): GuestMediaIntent[] {
  const q = normalize(text);
  const intents: GuestMediaIntent[] = [];
  if (PARKING_KEYWORDS.some((k) => q.includes(k.toLowerCase()))) {
    intents.push('parking');
  }
  if (DRESS_KEYWORDS.some((k) => q.includes(k.toLowerCase()))) {
    intents.push('dress');
  }
  return intents;
}

function siteBaseUrl(): string {
  const raw =
    process.env.LINE_MEDIA_BASE_URL?.trim() ||
    process.env.FRONTEND_URL?.trim() ||
    'https://jeabandmintwedding.online';
  return raw.replace(/\/$/, '');
}

export function resolveGuestMediaImageUrl(intent: GuestMediaIntent): string | null {
  if (intent === 'parking') {
    const override = process.env.LINE_PARKING_IMAGE_URL?.trim();
    if (override) return override;
    return `${siteBaseUrl()}/line/parking-map.jpg`;
  }
  const override = process.env.LINE_DRESS_IMAGE_URL?.trim();
  if (override) return override;
  return `${siteBaseUrl()}/line/dress-palette.jpg`;
}

export function buildGuestMediaImageMessages(
  intents: GuestMediaIntent[],
): messagingApi.ImageMessage[] {
  const messages: messagingApi.ImageMessage[] = [];
  for (const intent of intents) {
    const url = resolveGuestMediaImageUrl(intent);
    if (!url) continue;
    messages.push({
      type: 'image',
      originalContentUrl: url,
      previewImageUrl: url,
    });
  }
  return messages;
}
