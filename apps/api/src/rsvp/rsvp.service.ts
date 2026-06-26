import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { RsvpResponseDto } from './dto/rsvp-response.dto';

@Injectable()
export class RsvpService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * บันทึก RSVP: อัปเดตแขกจากลิงก์เชิญ หรือสร้างใหม่ (walk-in)
   */
  async create(dto: CreateRsvpDto): Promise<RsvpResponseDto> {
    if (dto.attending && (dto.attendeeCount == null || dto.attendeeCount < 1)) {
      throw new BadRequestException('กรุณาระบุจำนวนผู้มางาน');
    }

    if (dto.inviteToken) {
      return this.createFromInvite(dto);
    }
    return this.createWalkIn(dto);
  }

  private async createFromInvite(dto: CreateRsvpDto): Promise<RsvpResponseDto> {
    const existing = await this.prisma.guest.findUnique({
      where: { inviteToken: dto.inviteToken },
      include: { wish: true },
    });

    if (!existing) {
      throw new NotFoundException('ลิงก์เชิญไม่ถูกต้อง');
    }
    if (existing.rsvpAt) {
      throw new BadRequestException('ตอบรับไปแล้ว');
    }

    const guest = await this.prisma.guest.update({
      where: { id: existing.id },
      data: {
        name: dto.name,
        attending: dto.attending,
        attendeeCount: dto.attending ? dto.attendeeCount : null,
        rsvpAt: new Date(),
        ...(dto.wish && !existing.wish && {
          wish: { create: { message: dto.wish } },
        }),
      },
      include: { wish: true },
    });

    return {
      guestId: guest.id,
      name: guest.name!,
      attending: guest.attending!,
      attendeeCount: guest.attendeeCount ?? undefined,
      wishId: guest.wish?.id,
    };
  }

  private async createWalkIn(dto: CreateRsvpDto): Promise<RsvpResponseDto> {
    const guest = await this.prisma.guest.create({
      data: {
        displayName: dto.name,
        name: dto.name,
        attending: dto.attending,
        attendeeCount: dto.attending ? dto.attendeeCount : null,
        rsvpAt: new Date(),
        ...(dto.wish && {
          wish: { create: { message: dto.wish } },
        }),
      },
      include: { wish: true },
    });

    return {
      guestId: guest.id,
      name: guest.name!,
      attending: guest.attending!,
      attendeeCount: guest.attendeeCount ?? undefined,
      wishId: guest.wish?.id,
    };
  }
}
