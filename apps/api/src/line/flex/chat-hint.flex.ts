import { messagingApi } from '@line/bot-sdk';
import { HINT_PREFIXES } from '../bot-prefix';
import { header, PALETTE, toFlexMessage } from './theme';

/** ตัวอย่างคำถามที่โชว์ในการ์ด และใช้เป็นปุ่ม quick reply ด้วย */
const SAMPLES: Array<{ label: string; question: string }> = [
  { label: 'งานวันไหน', question: 'งานแต่งวันไหน เริ่มกี่โมงคะ' },
  { label: 'แต่งตัวยังไง', question: 'ควรแต่งตัวโทนไหนไปงานดีคะ' },
  { label: 'ที่จอดรถ', question: 'ที่จอดรถมีไหมคะ' },
  { label: 'เดินทางยังไง', question: 'เดินทางไปงานยังไงดีคะ' },
];

function prefixChip(prefix: string): messagingApi.FlexBox {
  return {
    type: 'box',
    layout: 'vertical',
    backgroundColor: PALETTE.cream,
    cornerRadius: '14px',
    paddingAll: '6px',
    contents: [
      {
        type: 'text',
        text: prefix,
        size: 'xs',
        weight: 'bold',
        color: PALETTE.mocha,
        align: 'center',
      },
    ],
  };
}

function sampleLine(question: string, botName: string): messagingApi.FlexBox {
  return {
    type: 'box',
    layout: 'baseline',
    spacing: 'sm',
    contents: [
      { type: 'text', text: '›', size: 'xs', color: PALETTE.copper, flex: 0 },
      {
        type: 'text',
        text: `${botName} ${question}`,
        size: 'xs',
        color: PALETTE.taupe,
        wrap: true,
      },
    ],
  };
}

/**
 * การ์ดสอนวิธีคุย — ส่งตอนกดปุ่มจาก rich menu และตอนแขกทักมาโดยยังไม่เคยคุย
 * @param selfCallName ชื่อที่บอทใช้เรียกตัวเอง เช่น "มายมิ้นท์" — ใช้เป็นตัวอย่างการพิมพ์
 * @param idleMinutes ระยะเวลาที่คุยต่อได้โดยไม่ต้องพิมพ์ชื่อซ้ำ
 */
export function buildChatHintFlex(
  botName: string,
  selfCallName: string,
  idleMinutes: number,
): messagingApi.FlexMessage {
  const bubble: messagingApi.FlexBubble = {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '0px',
      backgroundColor: PALETTE.creamLight,
      contents: [
        header('HOW TO CHAT', `คุยกับ${botName}`),
        {
          type: 'box',
          layout: 'vertical',
          paddingAll: '20px',
          spacing: 'md',
          contents: [
            {
              type: 'text',
              text: 'พิมพ์ชื่อน้องขึ้นต้น แล้วตามด้วยคำถามได้เลยค่ะ',
              size: 'sm',
              color: PALETTE.mocha,
              wrap: true,
            },
            {
              type: 'box',
              layout: 'horizontal',
              spacing: 'sm',
              contents: HINT_PREFIXES.map((prefix) => prefixChip(prefix)),
            },
            { type: 'separator', color: PALETTE.cream },
            {
              type: 'text',
              text: 'ตัวอย่าง',
              size: 'xxs',
              weight: 'bold',
              color: PALETTE.copper,
            },
            {
              type: 'box',
              layout: 'vertical',
              spacing: 'xs',
              contents: SAMPLES.slice(0, 3).map((sample) =>
                sampleLine(sample.question, selfCallName),
              ),
            },
            { type: 'separator', color: PALETTE.cream },
            {
              type: 'text',
              text: `คุยต่อเนื่องได้ ${idleMinutes} นาที โดยไม่ต้องพิมพ์ชื่อน้องซ้ำนะคะ 😊`,
              size: 'xxs',
              color: PALETTE.taupe,
              wrap: true,
            },
          ],
        },
      ],
    },
  };

  return toFlexMessage(`วิธีคุยกับ${botName} — พิมพ์ "${selfCallName}" นำหน้าคำถาม`, bubble);
}

/** ปุ่มคำถามยอดฮิต ติดไปกับข้อความสุดท้ายของ reply */
export function buildSampleQuickReply(selfCallName: string): messagingApi.QuickReply {
  return {
    items: SAMPLES.map((sample) => ({
      type: 'action',
      action: {
        type: 'message',
        label: sample.label,
        text: `${selfCallName} ${sample.question}`,
      },
    })),
  };
}
