import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { SettingsService } from '@/settings/settings.service';
import {
  CreateBotTopicDto,
  ReorderBotTopicsDto,
  UpdateBotPersonaDto,
  UpdateBotTopicDto,
} from './dto/bot-studio.dto';

const DEFAULT_PERSONA = {
  id: 'default',
  displayName: 'ผู้ช่วยงานแต่ง Jeab & Mint',
  tone: 'สุภาพ อบอุ่น เป็นกันเอง ใช้ภาษาที่อ่านง่าย',
  languageNote:
    'ตอบเป็นภาษาไทยเป็นหลัก ถ้าแขกถามเป็นภาษาอังกฤษให้ตอบอังกฤษได้',
  maxLength: 500,
  doNotDo:
    'ห้ามแต่งข้อมูลที่ไม่มีในบริบท ห้ามสัญญาเรื่องที่ยังไม่ยืนยัน ห้ามเปิดเผยข้อมูลส่วนตัวของแขกคนอื่น',
  whenUnknown:
    'ถ้าไม่รู้คำตอบ ให้แนะนำติดต่อเบอร์หรือ LINE OA ของงานตามข้อมูลพื้นฐาน',
};

@Injectable()
export class BotStudioService {
  private readonly logger = new Logger(BotStudioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  verifyPassword(password: string): void {
    const expected = process.env.BOT_STUDIO_PASSWORD?.trim();
    if (!expected) {
      throw new UnauthorizedException('Bot Studio ยังไม่ได้ตั้งรหัสผ่าน');
    }
    if (password !== expected) {
      throw new UnauthorizedException('รหัสผ่านไม่ถูกต้อง');
    }
  }

  async getPersona() {
    const existing = await this.prisma.botPersona.findUnique({
      where: { id: 'default' },
    });
    if (existing) return existing;
    return this.prisma.botPersona.create({ data: DEFAULT_PERSONA });
  }

  async updatePersona(dto: UpdateBotPersonaDto) {
    await this.getPersona();
    return this.prisma.botPersona.update({
      where: { id: 'default' },
      data: {
        displayName: dto.displayName,
        tone: dto.tone,
        languageNote: dto.languageNote,
        maxLength: dto.maxLength,
        doNotDo: dto.doNotDo,
        whenUnknown: dto.whenUnknown,
      },
    });
  }

  listTopics() {
    return this.prisma.botKnowledgeTopic.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createTopic(dto: CreateBotTopicDto) {
    const max = await this.prisma.botKnowledgeTopic.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = dto.sortOrder ?? (max._max.sortOrder ?? -1) + 1;
    return this.prisma.botKnowledgeTopic.create({
      data: {
        title: dto.title,
        body: dto.body,
        sortOrder,
      },
    });
  }

  async updateTopic(id: string, dto: UpdateBotTopicDto) {
    const existing = await this.prisma.botKnowledgeTopic.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('ไม่พบหัวข้อ');
    return this.prisma.botKnowledgeTopic.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.body !== undefined ? { body: dto.body } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });
  }

  async deleteTopic(id: string) {
    const existing = await this.prisma.botKnowledgeTopic.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('ไม่พบหัวข้อ');
    await this.prisma.botKnowledgeTopic.delete({ where: { id } });
    return { ok: true };
  }

  async reorderTopics(dto: ReorderBotTopicsDto) {
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.botKnowledgeTopic.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    return this.listTopics();
  }

  async getBasicsPreview() {
    const settings = await this.settingsService.getSettings();
    return {
      brideName: settings.brideName,
      brideNickname: settings.brideNickname,
      groomName: settings.groomName,
      groomNickname: settings.groomNickname,
      brideBio: settings.brideBio,
      groomBio: settings.groomBio,
      weddingDate: settings.weddingDate,
      venue: settings.venue,
      city: settings.city,
      mapsUrl: settings.mapsUrl,
      rsvpDeadline: settings.rsvpDeadline,
      rsvpContactPhone: settings.rsvpContactPhone,
      lineOaId: settings.lineOaId,
      timeline: settings.timeline,
      legacyBotKnowledge: settings.botKnowledge ?? null,
    };
  }

  async getLineUsage() {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
    if (!token) {
      return {
        configured: false,
        error: 'LINE_CHANNEL_ACCESS_TOKEN ยังไม่ได้ตั้งค่า',
        limit: null,
        used: null,
        remaining: null,
        type: null,
      };
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [quotaRes, consumptionRes] = await Promise.all([
        fetch('https://api.line.me/v2/bot/message/quota', { headers }),
        fetch('https://api.line.me/v2/bot/message/quota/consumption', {
          headers,
        }),
      ]);

      if (!quotaRes.ok || !consumptionRes.ok) {
        const qText = await quotaRes.text();
        const cText = await consumptionRes.text();
        this.logger.warn(`LINE quota API failed: ${quotaRes.status} ${qText} / ${consumptionRes.status} ${cText}`);
        return {
          configured: true,
          error: 'เรียก LINE quota API ไม่สำเร็จ',
          limit: null,
          used: null,
          remaining: null,
          type: null,
        };
      }

      const quota = (await quotaRes.json()) as {
        type?: string;
        value?: number;
      };
      const consumption = (await consumptionRes.json()) as {
        totalUsage?: number;
      };

      const type = quota.type ?? null;
      const limit =
        type === 'none' ? null : typeof quota.value === 'number' ? quota.value : null;
      const used =
        typeof consumption.totalUsage === 'number' ? consumption.totalUsage : null;
      const remaining =
        limit !== null && used !== null ? Math.max(0, limit - used) : null;

      return {
        configured: true,
        error: null,
        type,
        limit,
        used,
        remaining,
      };
    } catch (error) {
      this.logger.error('LINE quota fetch failed', error);
      return {
        configured: true,
        error: 'เชื่อมต่อ LINE quota API ไม่ได้',
        limit: null,
        used: null,
        remaining: null,
        type: null,
      };
    }
  }

  async getGeminiUsage() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayAgg, monthAgg, todayCount, monthCount, recent] =
      await Promise.all([
        this.prisma.botUsageLog.aggregate({
          where: {
            provider: 'gemini',
            kind: 'reply',
            createdAt: { gte: startOfDay },
          },
          _sum: {
            promptTokens: true,
            completionTokens: true,
            totalTokens: true,
          },
        }),
        this.prisma.botUsageLog.aggregate({
          where: {
            provider: 'gemini',
            kind: 'reply',
            createdAt: { gte: startOfMonth },
          },
          _sum: {
            promptTokens: true,
            completionTokens: true,
            totalTokens: true,
          },
        }),
        this.prisma.botUsageLog.count({
          where: {
            provider: 'gemini',
            kind: 'reply',
            createdAt: { gte: startOfDay },
          },
        }),
        this.prisma.botUsageLog.count({
          where: {
            provider: 'gemini',
            kind: 'reply',
            createdAt: { gte: startOfMonth },
          },
        }),
        this.prisma.botUsageLog.findMany({
          where: { provider: 'gemini', kind: 'reply' },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            promptTokens: true,
            completionTokens: true,
            totalTokens: true,
            createdAt: true,
            meta: true,
          },
        }),
      ]);

    return {
      today: {
        replies: todayCount,
        promptTokens: todayAgg._sum.promptTokens ?? 0,
        completionTokens: todayAgg._sum.completionTokens ?? 0,
        totalTokens: todayAgg._sum.totalTokens ?? 0,
      },
      month: {
        replies: monthCount,
        promptTokens: monthAgg._sum.promptTokens ?? 0,
        completionTokens: monthAgg._sum.completionTokens ?? 0,
        totalTokens: monthAgg._sum.totalTokens ?? 0,
      },
      recent,
      billingNote:
        'ยอดเครดิตเงิน Gemini prepaid ดูได้ที่ Google AI Studio / Cloud Billing — API key อย่างเดียวดึงยอดเงินคงเหลือไม่ได้',
      aiStudioUsageUrl: 'https://aistudio.google.com/usage',
    };
  }

  async logGeminiReply(usage: {
    promptTokens?: number | null;
    completionTokens?: number | null;
    totalTokens?: number | null;
    meta?: Prisma.InputJsonValue;
  }): Promise<void> {
    try {
      await this.prisma.botUsageLog.create({
        data: {
          provider: 'gemini',
          kind: 'reply',
          promptTokens: usage.promptTokens ?? null,
          completionTokens: usage.completionTokens ?? null,
          totalTokens: usage.totalTokens ?? null,
          meta: usage.meta ?? undefined,
        },
      });
    } catch (error) {
      this.logger.warn('Failed to write BotUsageLog', error);
    }
  }
}
