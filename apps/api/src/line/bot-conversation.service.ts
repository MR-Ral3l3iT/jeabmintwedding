import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

export interface BotTurn {
  role: 'user' | 'model';
  text: string;
}

export interface ConversationState {
  /** ประวัติที่ยังไม่หมดอายุ — ว่างเปล่าถ้าเงียบไปนานกว่า IDLE_MINUTES */
  history: BotTurn[];
  /** ยังอยู่ในโหมดคุยต่อเนื่อง (ไม่ต้องพิมพ์ชื่อบอทนำหน้า) */
  active: boolean;
  /** เพิ่งได้การ์ดสอนวิธีคุยไปแล้ว ไม่ต้องส่งซ้ำ */
  hintedRecently: boolean;
}

/**
 * ประวัติการคุยแบบมีอายุ เก็บแถวเดียวต่อหนึ่ง LINE user
 *
 * ตั้งใจไม่แตกเป็นตาราง message เพราะรอบหนึ่งอ่าน/เขียนแค่ครั้งเดียว และเราไม่มี
 * เคสที่ต้อง query ระดับข้อความ — JSON คอลัมน์เดียวจึงถูกกว่าทั้ง query และโค้ด
 */
@Injectable()
export class BotConversationService {
  private readonly logger = new Logger(BotConversationService.name);

  /** เงียบเกินเท่านี้ถือว่าจบบทสนทนา เริ่มนับใหม่ */
  static readonly IDLE_MINUTES = 45;
  /** เก็บ 8 คู่ถาม-ตอบ = 16 turn — พอคุยเล่นต่อเนื่องโดยไม่บวม prompt */
  private static readonly MAX_TURNS = 16;
  /** ตัดข้อความยาวๆ ก่อนเก็บ กันคำตอบเดียวกินโควตาประวัติทั้งก้อน */
  private static readonly MAX_TEXT_CHARS = 300;
  /** ไม่ยัดการ์ดสอนวิธีคุยให้คนเดิมบ่อยกว่านี้ */
  private static readonly HINT_COOLDOWN_HOURS = 24;
  private static readonly RETENTION_DAYS = 7;
  /** ล้างของเก่าแบบสุ่มระหว่างทาง แทนการตั้ง cron (โปรเจกต์ยังไม่มี scheduler) */
  private static readonly CLEANUP_SAMPLE_RATE = 0.02;

  constructor(private readonly prisma: PrismaService) {}

  async load(lineUserId: string): Promise<ConversationState> {
    const row = await this.prisma.botConversation.findUnique({
      where: { lineUserId },
    });
    if (!row) return { history: [], active: false, hintedRecently: false };

    const now = Date.now();
    const active =
      now - row.lastMessageAt.getTime() <
      BotConversationService.IDLE_MINUTES * 60_000;
    const hintedRecently =
      !!row.hintedAt &&
      now - row.hintedAt.getTime() <
        BotConversationService.HINT_COOLDOWN_HOURS * 3_600_000;

    return {
      history: active ? this.parseTurns(row.messages) : [],
      active,
      hintedRecently,
    };
  }

  /** บันทึกหนึ่งคู่ถาม-ตอบต่อท้ายประวัติ แล้วตัดให้เหลือเท่าที่กำหนด */
  async append(
    lineUserId: string,
    history: BotTurn[],
    userText: string,
    modelText: string,
    options: { hinted?: boolean } = {},
  ): Promise<void> {
    const next = [...history, this.turn('user', userText), this.turn('model', modelText)].slice(
      -BotConversationService.MAX_TURNS,
    );

    const messages = next as unknown as Prisma.InputJsonValue;
    const hintedAt = options.hinted ? new Date() : undefined;

    try {
      await this.prisma.botConversation.upsert({
        where: { lineUserId },
        create: {
          lineUserId,
          messages,
          lastMessageAt: new Date(),
          hintedAt: hintedAt ?? null,
        },
        update: {
          messages,
          lastMessageAt: new Date(),
          ...(hintedAt ? { hintedAt } : {}),
        },
      });
    } catch (error) {
      // ประวัติเป็นของเสริม ถ้าเขียนไม่ได้ก็ยังตอบแขกได้ตามปกติ
      this.logger.warn(`Failed to save conversation for ${lineUserId}`, error);
    }

    void this.maybeCleanup();
  }

  /** เปิดโหมดคุยและบันทึกว่าเพิ่งสอนวิธีใช้ไป — ใช้ตอนกดปุ่มจาก rich menu */
  async markHinted(lineUserId: string): Promise<void> {
    const now = new Date();
    try {
      await this.prisma.botConversation.upsert({
        where: { lineUserId },
        create: { lineUserId, messages: [], lastMessageAt: now, hintedAt: now },
        update: { lastMessageAt: now, hintedAt: now },
      });
    } catch (error) {
      this.logger.warn(`Failed to mark hint for ${lineUserId}`, error);
    }
  }

  private turn(role: BotTurn['role'], text: string): BotTurn {
    return { role, text: text.slice(0, BotConversationService.MAX_TEXT_CHARS) };
  }

  private parseTurns(value: Prisma.JsonValue): BotTurn[] {
    if (!Array.isArray(value)) return [];
    const turns = value.reduce<BotTurn[]>((acc, item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return acc;
      const { role, text } = item as { role?: unknown; text?: unknown };
      if ((role === 'user' || role === 'model') && typeof text === 'string') {
        acc.push({ role, text });
      }
      return acc;
    }, []);

    // Gemini ต้องการให้ประวัติเริ่มด้วยฝั่ง user เสมอ
    const firstUser = turns.findIndex((turn) => turn.role === 'user');
    return firstUser <= 0 ? turns : turns.slice(firstUser);
  }

  private async maybeCleanup(): Promise<void> {
    if (Math.random() > BotConversationService.CLEANUP_SAMPLE_RATE) return;
    const cutoff = new Date(
      Date.now() - BotConversationService.RETENTION_DAYS * 86_400_000,
    );
    try {
      const { count } = await this.prisma.botConversation.deleteMany({
        where: { lastMessageAt: { lt: cutoff } },
      });
      if (count) this.logger.log(`Pruned ${count} stale bot conversations`);
    } catch (error) {
      this.logger.warn('Conversation cleanup failed', error);
    }
  }
}
