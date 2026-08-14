import { Injectable, Logger } from '@nestjs/common';
import { validateSignature, messagingApi, webhook } from '@line/bot-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '@/prisma/prisma.service';
import { SettingsService } from '@/settings/settings.service';
import { BotStudioService } from '@/bot-studio/bot-studio.service';

const LINK_PATTERNS = [
  /^ผูก\s+([a-zA-Z0-9]+)$/i,
  /^link\s+([a-zA-Z0-9]+)$/i,
  /^bind\s+([a-zA-Z0-9]+)$/i,
];

@Injectable()
export class LineService {
  private readonly logger = new Logger(LineService.name);
  private readonly client: messagingApi.MessagingApiClient | null;
  private readonly channelSecret: string;
  private readonly gemini: GoogleGenerativeAI | null;
  private readonly rateLimit = new Map<string, number[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
    private readonly botStudioService: BotStudioService,
  ) {
    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? '';
    this.channelSecret = process.env.LINE_CHANNEL_SECRET ?? '';
    this.client = accessToken
      ? new messagingApi.MessagingApiClient({ channelAccessToken: accessToken })
      : null;

    const geminiKey = process.env.GEMINI_API_KEY ?? '';
    this.gemini = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

    if (!this.client) {
      this.logger.warn('LINE_CHANNEL_ACCESS_TOKEN not set — webhook replies disabled');
    }
    if (!this.gemini) {
      this.logger.warn('GEMINI_API_KEY not set — AI replies disabled');
    }
  }

  verifySignature(rawBody: Buffer, signature: string | undefined): boolean {
    if (!this.channelSecret || !signature) return false;
    return validateSignature(rawBody, this.channelSecret, signature);
  }

  async handleEvents(events: webhook.Event[]): Promise<void> {
    await Promise.all(events.map((event) => this.handleEvent(event)));
  }

  private async handleEvent(event: webhook.Event): Promise<void> {
    try {
      if (event.type === 'follow') {
        await this.onFollow(event);
        return;
      }
      if (event.type === 'unfollow') {
        await this.onUnfollow(event);
        return;
      }
      if (event.type === 'message' && event.message.type === 'text') {
        await this.onTextMessage(event);
      }
    } catch (error) {
      this.logger.error(`Failed to handle LINE event ${event.type}`, error);
    }
  }

  private async onFollow(event: webhook.FollowEvent): Promise<void> {
    const lineUserId = event.source?.userId;
    if (!lineUserId) return;

    const profile = await this.fetchProfile(lineUserId);
    await this.prisma.lineFriend.upsert({
      where: { lineUserId },
      create: {
        lineUserId,
        displayName: profile?.displayName,
        pictureUrl: profile?.pictureUrl,
        followedAt: new Date(),
        unfollowedAt: null,
      },
      update: {
        displayName: profile?.displayName,
        pictureUrl: profile?.pictureUrl,
        followedAt: new Date(),
        unfollowedAt: null,
      },
    });

    if (!event.replyToken) return;

    const settings = await this.settingsService.getSettings();
    await this.reply(
      event.replyToken,
      `ขอบคุณที่เพิ่มเพื่อนนะคะ 💚\nยินดีต้อนรับสู่ ${settings.brideNickname} & ${settings.groomNickname} Wedding\n\nถ้ามีลิงก์เชิญออนไลน์ พิมพ์:\nผูก <รหัสจากลิงก์>\nเพื่อเชื่อมบัญชีกับรายชื่อแขกได้ค่ะ`,
    );
  }

  private async onUnfollow(event: webhook.UnfollowEvent): Promise<void> {
    const lineUserId = event.source?.userId;
    if (!lineUserId) return;

    await this.prisma.lineFriend.updateMany({
      where: { lineUserId },
      data: { unfollowedAt: new Date() },
    });
  }

  private async onTextMessage(event: webhook.MessageEvent): Promise<void> {
    if (event.message.type !== 'text' || !event.replyToken) return;
    const lineUserId = event.source?.userId;
    if (!lineUserId) return;

    const text = event.message.text.trim();
    const token = this.extractLinkToken(text);
    if (token) {
      const result = await this.linkByInviteToken(lineUserId, token);
      await this.reply(event.replyToken, result.message);
      return;
    }

    if (!this.allowRate(lineUserId)) {
      await this.reply(
        event.replyToken,
        'ขออภัยค่ะ ตอนนี้ข้อความเข้ามาเยอะ กรุณารอสักครู่แล้วลองใหม่นะคะ',
      );
      return;
    }

    const answer = await this.generateBotReply(lineUserId, text);
    await this.reply(event.replyToken, answer);
  }

  private extractLinkToken(text: string): string | null {
    for (const pattern of LINK_PATTERNS) {
      const match = text.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  }

  async linkByInviteToken(
    lineUserId: string,
    inviteToken: string,
  ): Promise<{ ok: boolean; message: string }> {
    const guest = await this.prisma.guest.findUnique({
      where: { inviteToken },
      select: { id: true, displayName: true, name: true, lineUserId: true },
    });
    if (!guest) {
      return {
        ok: false,
        message: 'ไม่พบรหัสเชิญนี้ค่ะ ตรวจสอบรหัสจากลิงก์การ์ดอีกครั้งนะคะ',
      };
    }

    if (guest.lineUserId && guest.lineUserId !== lineUserId) {
      return {
        ok: false,
        message:
          'รายชื่อนี้ถูกเชื่อมกับบัญชี LINE อื่นแล้วค่ะ หากต้องการเปลี่ยน กรุณาติดต่อเจ้าของงาน',
      };
    }

    const existingLink = await this.prisma.lineFriend.findFirst({
      where: { guestId: guest.id, NOT: { lineUserId } },
    });
    if (existingLink) {
      return {
        ok: false,
        message: 'รายชื่อนี้ถูกเชื่อมกับบัญชี LINE อื่นแล้วค่ะ',
      };
    }

    // Already linked to this LINE user
    if (guest.lineUserId === lineUserId) {
      const label = guest.displayName ?? guest.name ?? 'คุณ';
      return {
        ok: true,
        message: `เชื่อมบัญชีเรียบร้อยแล้วค่ะ 💚\nยินดีต้อนรับ ${label}`,
      };
    }

    const profile = await this.fetchProfile(lineUserId);

    await this.prisma.$transaction([
      this.prisma.lineFriend.upsert({
        where: { lineUserId },
        create: {
          lineUserId,
          guestId: guest.id,
          displayName: profile?.displayName,
          pictureUrl: profile?.pictureUrl,
          followedAt: new Date(),
          unfollowedAt: null,
        },
        update: {
          guestId: guest.id,
          displayName: profile?.displayName ?? undefined,
          pictureUrl: profile?.pictureUrl ?? undefined,
          unfollowedAt: null,
        },
      }),
      this.prisma.guest.update({
        where: { id: guest.id },
        data: { lineUserId },
      }),
    ]);

    const label = guest.displayName ?? guest.name ?? 'คุณ';
    return {
      ok: true,
      message: `เชื่อมบัญชีเรียบร้อยแล้วค่ะ 💚\nยินดีต้อนรับ ${label}`,
    };
  }

  private async generateBotReply(lineUserId: string, question: string): Promise<string> {
    const [settings, persona, topics, friend] = await Promise.all([
      this.settingsService.getSettings(),
      this.botStudioService.getPersona(),
      this.botStudioService.listTopics(),
      this.prisma.lineFriend.findUnique({
        where: { lineUserId },
        include: { guest: { select: { displayName: true, name: true } } },
      }),
    ]);

    if (!this.gemini) {
      return (
        `ขอบคุณสำหรับข้อความค่ะ 💚\n` +
        `ขณะนี้ผู้ช่วยอัตโนมัติยังไม่พร้อม\n` +
        `สอบถามเพิ่มเติมได้ที่ ${settings.rsvpContactPhone} หรือ LINE OA ของงานค่ะ`
      );
    }

    const guestName =
      friend?.guest?.displayName ?? friend?.guest?.name ?? friend?.displayName ?? 'แขกผู้มีเกียรติ';

    const timeline = settings.timeline
      .map((item) => `- ${item.time} ${item.event}`)
      .join('\n');

    const topicKnowledge = topics
      .map((topic) => `### ${topic.title}\n${topic.body}`)
      .join('\n\n');

    const knowledge = [
      `งานแต่ง: ${settings.brideNickname} & ${settings.groomNickname}`,
      `เจ้าสาว: ${settings.brideName} (ชื่อเล่น ${settings.brideNickname})`,
      `เจ้าบ่าว: ${settings.groomName} (ชื่อเล่น ${settings.groomNickname})`,
      settings.brideBio ? `เกี่ยวกับเจ้าสาว: ${settings.brideBio}` : '',
      settings.groomBio ? `เกี่ยวกับเจ้าบ่าว: ${settings.groomBio}` : '',
      `วันงาน: ${new Date(settings.weddingDate).toLocaleString('th-TH', { dateStyle: 'full', timeStyle: 'short' })}`,
      `สถานที่: ${settings.venue}`,
      `ที่อยู่: ${settings.city}`,
      `แผนที่: ${settings.mapsUrl}`,
      `กำหนดตอบรับ: ${new Date(settings.rsvpDeadline).toLocaleDateString('th-TH', { dateStyle: 'long' })}`,
      `เบอร์ติดต่อ: ${settings.rsvpContactPhone}`,
      `LINE OA: ${settings.lineOaId}`,
      timeline ? `กำหนดการ:\n${timeline}` : '',
      topicKnowledge ? `ความรู้เพิ่มเติมจาก Bot Studio:\n${topicKnowledge}` : '',
      settings.botKnowledge
        ? `ข้อมูลเพิ่มเติม (legacy):\n${settings.botKnowledge}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const maxLen = persona.maxLength || 500;
    const system = `คุณคือ ${persona.displayName} ผู้ช่วยงานแต่งของ ${settings.brideNickname} และ ${settings.groomNickname}
โทนการพูด: ${persona.tone}
ภาษา: ${persona.languageNote}
ความยาว: สั้นกระชับ ไม่เกิน ${maxLen} ตัวอักษร
ความถูกต้อง: เวลา วันที่ ชื่อสถานที่ ชื่อคน เบอร์โทร และลิงก์ ต้องคัดลอกจาก "ข้อมูลงาน" ให้ตรงตัวอักษร ห้ามเดา ห้ามปรับ ห้ามปัดเวลา ถ้าข้อมูลงานไม่มีเรื่องที่ถูกถาม ให้บอกตรง ๆ ว่ายังไม่มีข้อมูลแล้วแนะนำให้ติดต่อเบอร์ข้างต้น
สิ่งที่ห้ามทำ: ${persona.doNotDo}
เมื่อไม่รู้คำตอบ: ${persona.whenUnknown}
ติดต่อสำรอง: เบอร์ ${settings.rsvpContactPhone} หรือ LINE ${settings.lineOaId}
ชื่อผู้ถาม: ${guestName}`;

    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent([
        { text: system },
        { text: `ข้อมูลงาน:\n${knowledge}` },
        { text: `คำถามจากแขก: ${question}` },
      ]);
      const text = result.response.text()?.trim();
      const usage = result.response.usageMetadata;
      await this.botStudioService.logGeminiReply({
        promptTokens: usage?.promptTokenCount ?? null,
        completionTokens: usage?.candidatesTokenCount ?? null,
        totalTokens: usage?.totalTokenCount ?? null,
        meta: { model: 'gemini-2.0-flash' },
      });
      if (!text) {
        return `ขออภัยค่ะ ตอบไม่สำเร็จ ลองถามใหม่หรือติดต่อ ${settings.rsvpContactPhone} ได้ค่ะ`;
      }
      return text.slice(0, Math.min(900, Math.max(maxLen, 100)));
    } catch (error) {
      this.logger.error('Gemini reply failed', error);
      return `ขออภัยค่ะ ระบบตอบข้อความขัดข้องชั่วคราว ติดต่อ ${settings.rsvpContactPhone} ได้ค่ะ`;
    }
  }

  private allowRate(lineUserId: string): boolean {
    const now = Date.now();
    const windowMs = 60_000;
    const max = 12;
    const stamps = (this.rateLimit.get(lineUserId) ?? []).filter((t) => now - t < windowMs);
    if (stamps.length >= max) {
      this.rateLimit.set(lineUserId, stamps);
      return false;
    }
    stamps.push(now);
    this.rateLimit.set(lineUserId, stamps);
    return true;
  }

  private async fetchProfile(
    lineUserId: string,
  ): Promise<{ displayName?: string; pictureUrl?: string } | null> {
    if (!this.client) return null;
    try {
      const profile = await this.client.getProfile(lineUserId);
      return {
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      };
    } catch {
      this.logger.warn(`Could not fetch LINE profile for ${lineUserId}`);
      return null;
    }
  }

  private async reply(replyToken: string, text: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.replyMessage({
        replyToken,
        messages: [{ type: 'text', text }],
      });
    } catch (error) {
      this.logger.error('LINE reply failed', error);
    }
  }
}
