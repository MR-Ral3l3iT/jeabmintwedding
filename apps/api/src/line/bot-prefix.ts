/**
 * คำขึ้นต้นที่ปลุกบอท. ชื่อบอทถูกล็อคไว้ที่ "น้องมายมิ้นท์" — ตัวย่อ mm/mymint
 * เผื่อคนพิมพ์ไทยไม่สะดวก
 *
 * ตรวจอย่างเดียว ไม่ตัดออก: "มิ้นท์" เป็นชื่อเล่นเจ้าบ่าวด้วย ถ้าตัดทิ้ง คำถามอย่าง
 * "มิ้นท์กับเจี๊ยบเจอกันยังไง" จะเหลือ "กับเจี๊ยบเจอกันยังไง" ซึ่งความหมายเพี้ยน
 */
export const BOT_PREFIXES = [
  'น้องมายมิ้นท์',
  'มายมิ้นท์',
  'มิ้นท์',
  'maimint',
  'mymint',
  'mm',
] as const;

/** ชุดที่โชว์ในการ์ดแนะนำ — สั้นและจำง่าย ไม่ต้องโชว์ทุกตัว */
export const HINT_PREFIXES = ['มายมิ้นท์', 'มิ้นท์', 'mm'] as const;

/**
 * \b ใช้ได้เฉพาะกับ prefix ที่เป็นอักษรละติน (JS มองอักษรไทยเป็น non-word char
 * ทำให้ขอบเขตคำเพี้ยน) ส่วนภาษาไทยไม่เว้นวรรคอยู่แล้ว แค่ match ต้นข้อความก็พอ
 */
const PREFIX_PATTERNS = BOT_PREFIXES.map(
  (prefix) => new RegExp(`^\\s*${prefix}${/^[a-z]+$/i.test(prefix) ? '\\b' : ''}`, 'i'),
);

export function hasBotPrefix(text: string): boolean {
  return PREFIX_PATTERNS.some((pattern) => pattern.test(text));
}
