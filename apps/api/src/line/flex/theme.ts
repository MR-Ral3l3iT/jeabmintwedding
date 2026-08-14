import { messagingApi } from '@line/bot-sdk';

/**
 * โทนสีเดียวกับการ์ดเชิญ — คัดลอกจาก WEDDING.palette ใน
 * apps/web/src/lib/constants.ts ถ้าเปลี่ยนสีการ์ด อย่าลืมอัปเดตที่นี่ด้วย
 */
export const PALETTE = {
  /** แถบหัวการ์ด — เขียวเข้มตระกูลเดียวกับ Olive Forest ของการ์ดเชิญ */
  forest: '#3C4A33',
  olive: '#73805D',
  mocha: '#5D3A26',
  copper: '#B8815B',
  /** copper สว่างขึ้นสำหรับตัวอักษรเล็กบนพื้นเขียว — copper ปกติ contrast ไม่พอ */
  copperLight: '#D2A379',
  taupe: '#947B68',
  cream: '#E6E2D3',
  creamLight: '#F6F2E9',
  white: '#FFFFFF',
} as const;

/** postback data ที่ webhook รู้จัก — ต้องตรงกับ scripts/setup-richmenu.mjs */
export const POSTBACK = {
  chat: 'richmenu=chat',
  banner: 'richmenu=banner',
} as const;

/** แถบหัวการ์ดสีเขียวเข้ม พร้อมข้อความกำกับเล็กๆ ด้านบน */
export function header(
  eyebrow: string,
  title: string,
): messagingApi.FlexBox {
  return {
    type: 'box',
    layout: 'vertical',
    backgroundColor: PALETTE.forest,
    paddingAll: '18px',
    spacing: 'xs',
    contents: [
      {
        type: 'text',
        text: eyebrow,
        size: 'xxs',
        color: PALETTE.copperLight,
        align: 'center',
      },
      {
        type: 'text',
        text: title,
        size: 'lg',
        weight: 'bold',
        color: PALETTE.cream,
        align: 'center',
        wrap: true,
      },
    ],
  };
}

/** แถวข้อมูล label / value ที่ตัดคำได้ */
export function infoRow(label: string, value: string): messagingApi.FlexBox {
  return {
    type: 'box',
    layout: 'baseline',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: label,
        size: 'xs',
        color: PALETTE.taupe,
        flex: 2,
      },
      {
        type: 'text',
        text: value,
        size: 'xs',
        color: PALETTE.mocha,
        flex: 5,
        wrap: true,
      },
    ],
  };
}

/**
 * รูปโปรไฟล์ทรงกลม — Flex ตัดมุมลูกที่อยู่ในกล่องตาม cornerRadius ให้เอง
 * ถ้าไม่มีรูป (แขกไม่ได้ตั้ง หรือดึง profile ไม่สำเร็จ) ใช้อักษรตัวแรกของชื่อแทน
 */
export function avatar(
  pictureUrl: string | null | undefined,
  displayName: string,
  size = '96px',
): messagingApi.FlexBox {
  const circle: messagingApi.FlexBox = {
    type: 'box',
    layout: 'vertical',
    width: size,
    height: size,
    cornerRadius: '100px',
    borderWidth: '3px',
    borderColor: PALETTE.copper,
    backgroundColor: PALETTE.cream,
    justifyContent: 'center',
    contents: pictureUrl
      ? [
          {
            type: 'image',
            url: pictureUrl,
            size: 'full',
            aspectRatio: '1:1',
            aspectMode: 'cover',
          },
        ]
      : [
          {
            type: 'text',
            text: displayName.trim().charAt(0) || '♥',
            size: 'xxl',
            weight: 'bold',
            color: PALETTE.copper,
            align: 'center',
          },
        ],
  };

  // ห่ออีกชั้นเพื่อจัดกึ่งกลาง — กล่องที่กำหนด width เองจะชิดซ้ายถ้าไม่ห่อ
  return {
    type: 'box',
    layout: 'vertical',
    alignItems: 'center',
    contents: [circle],
  };
}

/** ปุ่มเริ่มคุยกับบอท — ใช้ทั้งในการ์ดต้อนรับและที่อื่นๆ */
export function chatButton(label: string): messagingApi.FlexButton {
  return {
    type: 'button',
    style: 'primary',
    height: 'sm',
    color: PALETTE.olive,
    action: {
      type: 'postback',
      label,
      data: POSTBACK.chat,
      displayText: label,
    },
  };
}

/** ห่อ bubble เป็น flex message พร้อม altText ที่แสดงใน push notification */
export function toFlexMessage(
  altText: string,
  bubble: messagingApi.FlexBubble,
): messagingApi.FlexMessage {
  return { type: 'flex', altText, contents: bubble };
}
