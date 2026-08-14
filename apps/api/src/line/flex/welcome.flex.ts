import { messagingApi } from '@line/bot-sdk';
import { WeddingSettingsResponseDto } from '@/settings/dto/wedding-settings.dto';
import { avatar, chatButton, header, infoRow, PALETTE, toFlexMessage } from './theme';

export interface WelcomeProfile {
  displayName: string | null | undefined;
  pictureUrl: string | null | undefined;
}

function formatWeddingDate(iso: string): string {
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * การ์ดต้อนรับหลังแขกกด "เพิ่มเพื่อน" — โชว์รูปโปรไฟล์กับชื่อ LINE ของแขกเอง
 * เพื่อให้รู้สึกว่าเป็นข้อความถึงตัวเขา ไม่ใช่ broadcast
 */
export function buildWelcomeFlex(
  profile: WelcomeProfile,
  settings: WeddingSettingsResponseDto,
  botName: string,
): messagingApi.FlexMessage {
  const guestName = profile.displayName?.trim() || 'แขกผู้มีเกียรติ';
  const couple = `${settings.brideNickname} & ${settings.groomNickname}`;

  const bubble: messagingApi.FlexBubble = {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '0px',
      backgroundColor: PALETTE.creamLight,
      contents: [
        header('WELCOME', couple),
        {
          type: 'box',
          layout: 'vertical',
          paddingAll: '20px',
          spacing: 'md',
          contents: [
            avatar(profile.pictureUrl, guestName),
            {
              type: 'text',
              text: `ยินดีต้อนรับ ${guestName}`,
              size: 'md',
              weight: 'bold',
              color: PALETTE.mocha,
              align: 'center',
              wrap: true,
            },
            {
              type: 'text',
              text: [
                '💚 ดีใจที่ได้เจอกันที่นี่นะคะ',
                'ขอบคุณที่มาเป็นส่วนหนึ่งของวันพิเศษของเรา ✨',
                'เรื่องราวและรายละเอียดของงานแต่ง',
                'เราจะคอยอัปเดตให้ที่นี่นะ',
                'แล้วมาเจอกันในวันสำคัญของเรานะคะ 🤍',
              ].join('\n'),
              size: 'xs',
              color: PALETTE.taupe,
              align: 'center',
              wrap: true,
            },
            { type: 'separator', color: PALETTE.cream },
            {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                infoRow('วันงาน', formatWeddingDate(settings.weddingDate)),
                infoRow('สถานที่', settings.venue),
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: PALETTE.creamLight,
      paddingAll: '16px',
      paddingTop: '0px',
      spacing: 'sm',
      contents: [
        chatButton(`คุยกับ${botName}`),
        {
          type: 'text',
          text: 'มีคำถามเรื่องงานแต่ง ถามได้ตลอดเลยนะคะ',
          size: 'xxs',
          color: PALETTE.taupe,
          align: 'center',
          wrap: true,
        },
      ],
    },
  };

  return toFlexMessage(`ยินดีต้อนรับ ${guestName} — งานแต่ง ${couple}`, bubble);
}
