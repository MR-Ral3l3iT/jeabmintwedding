import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { LineService } from '@/line/line.service';
import {
  JoinGuestResponseDto,
  LinkLineDto,
  LinkLineResponseDto,
  SubmitJoinDto,
  SubmitJoinResponseDto,
} from './dto/join.dto';

const FALLBACK_LINE_OA_URL = 'https://line.me/R/ti/p/@528nhzxv';

function generateInviteToken(): string {
  return randomBytes(16).toString('hex');
}

@Injectable()
export class JoinService {
  private readonly logger = new Logger(JoinService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly lineService: LineService,
  ) {}

  async getByToken(token: string): Promise<JoinGuestResponseDto> {
    const guest = await this.prisma.guest.findUnique({
      where: { inviteToken: token },
      select: {
        displayName: true,
        name: true,
        partySide: true,
        locale: true,
        inviteToken: true,
      },
    });

    if (!guest?.inviteToken) {
      throw new NotFoundException('ไม่พบลิงก์ลงทะเบียนนี้');
    }

    return {
      displayName: guest.displayName ?? undefined,
      name: guest.name ?? undefined,
      partySide: guest.partySide ?? undefined,
      locale: guest.locale,
      inviteToken: guest.inviteToken,
    };
  }

  async submit(dto: SubmitJoinDto): Promise<SubmitJoinResponseDto> {
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('กรุณากรอกชื่อเรียกในงาน');
    }

    const lineOaUrl = await this.getLineOaUrl();

    if (dto.token) {
      return this.updateExisting(dto.token, name, dto.partySide, lineOaUrl);
    }
    return this.createOffline(name, dto.partySide, lineOaUrl);
  }

  async linkLine(dto: LinkLineDto): Promise<LinkLineResponseDto> {
    const lineUserId = await this.verifyLineIdToken(dto.idToken);
    const result = await this.lineService.linkByInviteToken(
      lineUserId,
      dto.inviteToken.trim(),
    );

    if (!result.ok) {
      throw new BadRequestException(result.message);
    }

    return { ok: true, message: result.message };
  }

  private async verifyLineIdToken(idToken: string): Promise<string> {
    const clientId = process.env.LINE_LOGIN_CHANNEL_ID?.trim();
    if (!clientId) {
      throw new ServiceUnavailableException('LINE Login ยังไม่ได้ตั้งค่าบนเซิร์ฟเวอร์');
    }

    try {
      const body = new URLSearchParams({
        id_token: idToken,
        client_id: clientId,
      });
      const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.warn(`LINE ID token verify failed: ${res.status} ${text}`);
        throw new UnauthorizedException('ยืนยันตัวตน LINE ไม่สำเร็จ กรุณาลองใหม่');
      }

      const data = (await res.json()) as { sub?: string };
      if (!data.sub) {
        throw new UnauthorizedException('ยืนยันตัวตน LINE ไม่สำเร็จ');
      }
      return data.sub;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }
      this.logger.error('LINE ID token verify error', error);
      throw new UnauthorizedException('ยืนยันตัวตน LINE ไม่สำเร็จ กรุณาลองใหม่');
    }
  }

  private async updateExisting(
    token: string,
    name: string,
    partySide: SubmitJoinDto['partySide'],
    lineOaUrl: string,
  ): Promise<SubmitJoinResponseDto> {
    const existing = await this.prisma.guest.findUnique({
      where: { inviteToken: token },
      select: { id: true, inviteToken: true },
    });

    if (!existing?.inviteToken) {
      throw new NotFoundException('ไม่พบลิงก์ลงทะเบียนนี้');
    }

    const guest = await this.prisma.guest.update({
      where: { id: existing.id },
      data: { name, partySide },
      select: { inviteToken: true, name: true, partySide: true },
    });

    return {
      inviteToken: guest.inviteToken!,
      name: guest.name!,
      partySide: guest.partySide!,
      lineOaUrl,
    };
  }

  private async createOffline(
    name: string,
    partySide: SubmitJoinDto['partySide'],
    lineOaUrl: string,
  ): Promise<SubmitJoinResponseDto> {
    await this.ensureOfflineCategory();
    let inviteToken = generateInviteToken();

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const guest = await this.prisma.guest.create({
          data: {
            displayName: name,
            name,
            partySide,
            inviteToken,
            categoryId: 'OFFLINE',
          },
          select: { inviteToken: true, name: true, partySide: true },
        });

        return {
          inviteToken: guest.inviteToken!,
          name: guest.name!,
          partySide: guest.partySide!,
          lineOaUrl,
        };
      } catch (err: unknown) {
        const code =
          err && typeof err === 'object' && 'code' in err
            ? (err as { code?: string }).code
            : undefined;
        if (code === 'P2002') {
          inviteToken = generateInviteToken();
          continue;
        }
        throw err;
      }
    }

    throw new BadRequestException('ไม่สามารถสร้างรหัสลงทะเบียนได้ กรุณาลองใหม่');
  }

  private async ensureOfflineCategory(): Promise<void> {
    await this.prisma.guestCategory.upsert({
      where: { id: 'OFFLINE' },
      create: { id: 'OFFLINE', name: 'ออฟไลน์', sortOrder: 0 },
      update: {},
    });
  }

  private async getLineOaUrl(): Promise<string> {
    const settings = await this.prisma.weddingSettings.findUnique({
      where: { id: 'default' },
      select: { lineOaUrl: true },
    });
    return settings?.lineOaUrl || FALLBACK_LINE_OA_URL;
  }
}
