import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  JoinGuestResponseDto,
  SubmitJoinDto,
  SubmitJoinResponseDto,
} from './dto/join.dto';

const FALLBACK_LINE_OA_URL = 'https://line.me/R/ti/p/@528nhzxv';

function generateInviteToken(): string {
  return randomBytes(16).toString('hex');
}

@Injectable()
export class JoinService {
  constructor(private readonly prisma: PrismaService) {}

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
    let inviteToken = generateInviteToken();

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const guest = await this.prisma.guest.create({
          data: {
            displayName: name,
            name,
            partySide,
            inviteToken,
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

  private async getLineOaUrl(): Promise<string> {
    const settings = await this.prisma.weddingSettings.findUnique({
      where: { id: 'default' },
      select: { lineOaUrl: true },
    });
    return settings?.lineOaUrl || FALLBACK_LINE_OA_URL;
  }
}
