import { Injectable, Logger } from '@nestjs/common';
import { validateSignature, messagingApi, webhook } from '@line/bot-sdk';
import { Content, GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '@/prisma/prisma.service';
import { SettingsService } from '@/settings/settings.service';
import { BotStudioService } from '@/bot-studio/bot-studio.service';
import { SeatingService } from '@/admin/seating.service';
import { BotConversationService, BotTurn } from './bot-conversation.service';
import { hasBotPrefix } from './bot-prefix';
import { buildWelcomeFlex } from './flex/welcome.flex';
import { buildChatHintFlex, buildSampleQuickReply } from './flex/chat-hint.flex';
import { POSTBACK } from './flex/theme';

const LINK_PATTERNS = [
  /^ผูก\s+([a-zA-Z0-9]+)$/i,
  /^link\s+([a-zA-Z0-9]+)$/i,
  /^bind\s+([a-zA-Z0-9]+)$/i,
];

/**
 * Google ปลดระวางรุ่นเก่าเงียบๆ (gemini-2.0-flash ตายไปแล้ว บอทเลยตอบ error อยู่พักหนึ่ง)
 * เลยเปิดให้เปลี่ยนผ่าน env ได้ ไม่ต้องแก้โค้ด — ดูรุ่นที่ใช้ได้จาก
 *   curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"
 * flash-lite พอสำหรับ FAQ งานแต่ง และถูก/เร็วกว่า flash ตัวเต็มที่เผา thinking token
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';

/**
 * เพดานความยาวของบล็อกข้อมูลงาน ที่ส่งไปกับทุกคำถาม หัวข้อใน Bot Studio เพิ่มได้
 * เรื่อยๆ ถ้าไม่คุมไว้ prompt จะโตขึ้นทุกครั้งที่มีคนเพิ่มหัวข้อ
 */
const MAX_KNOWLEDGE_CHARS = 6000;

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
    private readonly conversations: BotConversationService,
    private readonly seatingService: SeatingService,
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
      if (event.type === 'postback') {
        await this.onPostback(event);
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

    const [settings, persona] = await Promise.all([
      this.settingsService.getSettings(),
      this.botStudioService.getPersona(),
    ]);

    // การ์ดอย่างเดียว ไม่แนบวิธีพิมพ์ "ผูก <รหัส>" — แขกที่มาจากลิงก์เชิญถูกผูกผ่าน LIFF
    // ให้อัตโนมัติอยู่แล้ว คำสั่งนั้นเหลือไว้เป็นทางสำรองเวลาต้องผูกให้ทีหลังเท่านั้น
    await this.reply(event.replyToken, [
      buildWelcomeFlex(
        { displayName: profile?.displayName, pictureUrl: profile?.pictureUrl },
        settings,
        persona.displayName,
      ),
    ]);
  }

  /** ปุ่มบน rich menu ส่ง postback มาที่นี่ ปุ่มแบนเนอร์ตกลงมาแล้วถูกเมินตามตั้งใจ */
  private async onPostback(event: webhook.PostbackEvent): Promise<void> {
    if (event.postback?.data !== POSTBACK.chat) return;
    const lineUserId = event.source?.userId;
    if (!lineUserId || !event.replyToken) return;

    const persona = await this.botStudioService.getPersona();

    // กดปุ่มนี้ = เปิดโหมดคุย พิมพ์คำถามต่อได้เลยโดยไม่ต้องมีชื่อบอทนำหน้า
    await this.conversations.markHinted(lineUserId);

    const hint = buildChatHintFlex(
      persona.displayName,
      persona.selfCallName,
      BotConversationService.IDLE_MINUTES,
    );
    hint.quickReply = buildSampleQuickReply(persona.selfCallName);
    await this.reply(event.replyToken, [hint]);
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
      await this.reply(event.replyToken, [{ type: 'text', text: result.message }]);
      return;
    }

    if (!this.allowRate(lineUserId)) {
      await this.reply(event.replyToken, [
        {
          type: 'text',
          text: 'ขออภัยค่ะ ตอนนี้ข้อความเข้ามาเยอะ กรุณารอสักครู่แล้วลองใหม่นะคะ',
        },
      ]);
      return;
    }

    const [persona, state] = await Promise.all([
      this.botStudioService.getPersona(),
      this.conversations.load(lineUserId),
    ]);

    /**
     * แขกที่ยังไม่เคยรู้วิธีคุย และทักมาลอยๆ จะได้การ์ดสอนวิธีคุย *พร้อมคำตอบ*
     * ในรอบเดียว (reply token ส่งได้ถึง 5 ข้อความ) — ส่งแต่การ์ดอย่างเดียวจะดูเหมือน
     * คำถามเขาถูกเมิน ส่วนคนที่พิมพ์ชื่อบอทนำหน้าอยู่แล้วก็ไม่ต้องสอนอะไร
     */
    const needHint = !hasBotPrefix(text) && !state.active && !state.hintedRecently;

    const answer = await this.generateBotReply({
      lineUserId,
      question: text,
      history: state.history,
      persona,
    });

    const reply: messagingApi.Message[] = [];
    if (needHint) {
      reply.push(
        buildChatHintFlex(
          persona.displayName,
          persona.selfCallName,
          BotConversationService.IDLE_MINUTES,
        ),
      );
    }
    reply.push({
      type: 'text',
      text: answer,
      ...(needHint ? { quickReply: buildSampleQuickReply(persona.selfCallName) } : {}),
    });

    await this.reply(event.replyToken, reply);
    await this.conversations.append(lineUserId, state.history, text, answer, {
      hinted: needHint,
    });
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

  private async generateBotReply(params: {
    lineUserId: string;
    question: string;
    history: BotTurn[];
    persona: {
      displayName: string;
      selfCallName: string;
      tone: string;
      languageNote: string;
      emojiPolicy: string;
      maxLength: number;
      doNotDo: string;
      whenUnknown: string;
    };
  }): Promise<string> {
    const { lineUserId, question, history, persona } = params;
    const [settings, topics, friend] = await Promise.all([
      this.settingsService.getSettings(),
      this.botStudioService.listTopics(),
      this.prisma.lineFriend.findUnique({
        where: { lineUserId },
        include: { guest: { select: { id: true, displayName: true, name: true } } },
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

    const seatingSummary = await this.seatingService.buildBotKnowledgeSummary(
      friend?.guest?.id ?? null,
    );

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
      seatingSummary,
      !friend?.guest?.id
        ? 'หมายเหตุโต๊ะส่วนตัว: ผู้ถามยังไม่ได้ผูกบัญชีกับรายชื่อแขก ถ้าถามว่าโต๊ะตัวเองอยู่ไหน ให้แนะนำให้ผูกบัญชีก่อน'
        : '',
      topicKnowledge ? `ความรู้เพิ่มเติมจาก Bot Studio:\n${topicKnowledge}` : '',
      settings.botKnowledge
        ? `ข้อมูลเพิ่มเติม (legacy):\n${settings.botKnowledge}`
        : '',
    ]
      .filter(Boolean)
      .join('\n')
      .slice(0, MAX_KNOWLEDGE_CHARS);

    const maxLen = persona.maxLength || 500;
    const system = `คุณคือ ${persona.displayName} ผู้ช่วยงานแต่งของ ${settings.brideNickname} และ ${settings.groomNickname}
แทนตัวเองว่า "${persona.selfCallName}" เสมอ ห้ามใช้ ฉัน/ดิฉัน/เรา/ผม
โทนการพูด: ${persona.tone}
ภาษา: ${persona.languageNote}
อีโมจิ: ${persona.emojiPolicy}
ความยาว: สั้นกระชับ ไม่เกิน ${maxLen} ตัวอักษร
ความถูกต้อง: เวลา วันที่ ชื่อสถานที่ ชื่อคน เบอร์โทร และลิงก์ ต้องคัดลอกจาก "ข้อมูลงาน" ให้ตรงตัวอักษร ห้ามเดา ห้ามปรับ ห้ามปัดเวลา ถ้าข้อมูลงานไม่มีเรื่องที่ถูกถาม ให้บอกตรง ๆ ว่ายังไม่มีข้อมูลแล้วแนะนำให้ติดต่อเบอร์ข้างต้น
สิ่งที่ห้ามทำ: ${persona.doNotDo}
เมื่อไม่รู้คำตอบ: ${persona.whenUnknown}
ติดต่อสำรอง: เบอร์ ${settings.rsvpContactPhone} หรือ LINE ${settings.lineOaId}
ชื่อผู้ถาม: ${guestName}`;

    try {
      // ข้อมูลงานอยู่ใน systemInstruction ไม่ใช่ในประวัติ — ประวัติจะได้เก็บแต่บทสนทนาจริง
      const model = this.gemini.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: `${system}\n\nข้อมูลงาน:\n${knowledge}`,
      });
      const chat = model.startChat({ history: this.toGeminiHistory(history) });
      const result = await chat.sendMessage(question);
      const text = result.response.text()?.trim();
      const usage = result.response.usageMetadata;
      await this.botStudioService.logGeminiReply({
        promptTokens: usage?.promptTokenCount ?? null,
        completionTokens: usage?.candidatesTokenCount ?? null,
        totalTokens: usage?.totalTokenCount ?? null,
        meta: { model: GEMINI_MODEL, historyTurns: history.length },
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

  private toGeminiHistory(history: BotTurn[]): Content[] {
    return history.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    }));
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

  /** LINE รับได้สูงสุด 5 ข้อความต่อหนึ่ง reply token */
  private async reply(
    replyToken: string,
    messages: messagingApi.Message[],
  ): Promise<void> {
    if (!this.client || messages.length === 0) return;
    try {
      await this.client.replyMessage({
        replyToken,
        messages: messages.slice(0, 5),
      });
    } catch (error) {
      this.logger.error('LINE reply failed', error);
    }
  }
}
