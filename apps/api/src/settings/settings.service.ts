import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '@/prisma/prisma.service';
import {
  TimelineItemDto,
  UpdateWeddingSettingsDto,
  WeddingSettingsResponseDto,
} from './dto/wedding-settings.dto';

const SETTINGS_ID = 'default';

export interface UploadedImageFile {
  buffer: Buffer;
  mimetype: string;
}

const DEFAULT_TIMELINE: TimelineItemDto[] = [
  { time: '14:00', event: 'พิธีแห่ขันหมาก' },
  { time: '15:30', event: 'พิธีหลั่งน้ำพระพุทธมนต์' },
  { time: '18:00', event: 'พิธีฉลองมงคลสมรส (โต๊ะจีน)' },
];

function getUploadDir(): string {
  return path.resolve(process.cwd(), '../web/public/uploads');
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseTimeline(value: Prisma.JsonValue): TimelineItemDto[] {
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (item): item is { time: string; event: string } =>
          !!item &&
          typeof item === 'object' &&
          'time' in item &&
          'event' in item &&
          typeof item.time === 'string' &&
          typeof item.event === 'string',
      )
      .map((item) => ({ time: item.time, event: item.event }));
  }

  private toDto(row: {
    groomName: string;
    groomNickname: string;
    brideName: string;
    brideNickname: string;
    weddingDate: Date;
    venue: string;
    city: string;
    lineOaId: string;
    lineOaUrl: string;
    rsvpContactPhone: string;
    mapsUrl: string;
    rsvpDeadline: Date;
    promptpay: string | null;
    promptpayName: string | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountName: string | null;
    paymentQrUrl: string | null;
    timeline: Prisma.JsonValue;
    groomBio: string | null;
    brideBio: string | null;
    botKnowledge: string | null;
    updatedAt: Date;
  }): WeddingSettingsResponseDto {
    return {
      groomName: row.groomName,
      groomNickname: row.groomNickname,
      brideName: row.brideName,
      brideNickname: row.brideNickname,
      weddingDate: row.weddingDate.toISOString(),
      venue: row.venue,
      city: row.city,
      lineOaId: row.lineOaId,
      lineOaUrl: row.lineOaUrl,
      rsvpContactPhone: row.rsvpContactPhone,
      mapsUrl: row.mapsUrl,
      rsvpDeadline: row.rsvpDeadline.toISOString(),
      promptpay: row.promptpay ?? undefined,
      promptpayName: row.promptpayName ?? undefined,
      bankName: row.bankName ?? undefined,
      bankAccountNumber: row.bankAccountNumber ?? undefined,
      bankAccountName: row.bankAccountName ?? undefined,
      paymentQrUrl: row.paymentQrUrl ?? undefined,
      timeline: this.parseTimeline(row.timeline),
      groomBio: row.groomBio ?? undefined,
      brideBio: row.brideBio ?? undefined,
      botKnowledge: row.botKnowledge ?? undefined,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private defaultCreateData() {
    return {
      id: SETTINGS_ID,
      groomName: 'ปิติสันห์ อินทพิชัย',
      groomNickname: 'มิ้นท์',
      brideName: 'นิรมล เจตเพ็ญภาส',
      brideNickname: 'เจี๊ยบ',
      weddingDate: new Date('2026-10-31T14:00:00+07:00'),
      venue: 'กรมยุทธบริการทหาร กองบัญชาการกองทัพไทย',
      city: 'อาคารอเนกประสงค์ กรุงเทพฯ',
      lineOaId: '@528nhzxv',
      lineOaUrl: 'https://line.me/R/ti/p/@528nhzxv',
      rsvpContactPhone: '0655496538',
      mapsUrl: 'https://maps.app.goo.gl/MuHkXeetp6Ac5zGu9',
      rsvpDeadline: new Date('2026-10-14T00:00:00+07:00'),
      promptpay: '081-234-5678',
      promptpayName: 'นิรมล เจตเพ็ญภาส',
      bankName: null,
      bankAccountNumber: null,
      bankAccountName: null,
      paymentQrUrl: null,
      timeline: DEFAULT_TIMELINE as unknown as Prisma.InputJsonValue,
    };
  }

  async getSettings(): Promise<WeddingSettingsResponseDto> {
    const row = await this.prisma.weddingSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: this.defaultCreateData(),
    });
    return this.toDto(row);
  }

  async updateSettings(dto: UpdateWeddingSettingsDto): Promise<WeddingSettingsResponseDto> {
    await this.getSettings();

    const data: Prisma.WeddingSettingsUpdateInput = {
      ...(dto.groomName !== undefined && { groomName: dto.groomName.trim() }),
      ...(dto.groomNickname !== undefined && { groomNickname: dto.groomNickname.trim() }),
      ...(dto.brideName !== undefined && { brideName: dto.brideName.trim() }),
      ...(dto.brideNickname !== undefined && { brideNickname: dto.brideNickname.trim() }),
      ...(dto.weddingDate !== undefined && { weddingDate: new Date(dto.weddingDate) }),
      ...(dto.venue !== undefined && { venue: dto.venue.trim() }),
      ...(dto.city !== undefined && { city: dto.city.trim() }),
      ...(dto.lineOaId !== undefined && { lineOaId: dto.lineOaId.trim() }),
      ...(dto.lineOaUrl !== undefined && { lineOaUrl: dto.lineOaUrl.trim() }),
      ...(dto.rsvpContactPhone !== undefined && {
        rsvpContactPhone: dto.rsvpContactPhone.trim(),
      }),
      ...(dto.mapsUrl !== undefined && { mapsUrl: dto.mapsUrl.trim() }),
      ...(dto.rsvpDeadline !== undefined && { rsvpDeadline: new Date(dto.rsvpDeadline) }),
      ...(dto.promptpay !== undefined && { promptpay: dto.promptpay.trim() || null }),
      ...(dto.promptpayName !== undefined && {
        promptpayName: dto.promptpayName.trim() || null,
      }),
      ...(dto.bankName !== undefined && { bankName: dto.bankName.trim() || null }),
      ...(dto.bankAccountNumber !== undefined && {
        bankAccountNumber: dto.bankAccountNumber.trim() || null,
      }),
      ...(dto.bankAccountName !== undefined && {
        bankAccountName: dto.bankAccountName.trim() || null,
      }),
      ...(dto.timeline !== undefined && {
        timeline: dto.timeline as unknown as Prisma.InputJsonValue,
      }),
      ...(dto.groomBio !== undefined && { groomBio: dto.groomBio.trim() || null }),
      ...(dto.brideBio !== undefined && { brideBio: dto.brideBio.trim() || null }),
      ...(dto.botKnowledge !== undefined && {
        botKnowledge: dto.botKnowledge.trim() || null,
      }),
    };

    const row = await this.prisma.weddingSettings.update({
      where: { id: SETTINGS_ID },
      data,
    });

    return this.toDto(row);
  }

  async uploadPaymentQr(file: UploadedImageFile): Promise<WeddingSettingsResponseDto> {
    if (!file) {
      throw new BadRequestException('กรุณาเลือกไฟล์รูป QR Code');
    }

    const uploadDir = getUploadDir();
    fs.mkdirSync(uploadDir, { recursive: true });

    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const filename = `payment-qr.${ext}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    const paymentQrUrl = `/uploads/${filename}?v=${Date.now()}`;

    await this.getSettings();
    const row = await this.prisma.weddingSettings.update({
      where: { id: SETTINGS_ID },
      data: { paymentQrUrl },
    });

    return this.toDto(row);
  }
}
