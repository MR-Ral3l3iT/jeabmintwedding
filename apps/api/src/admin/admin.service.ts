import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { GetGuestsQueryDto } from './dto/get-guests-query.dto';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { GuestListResponseDto, GuestResponseDto } from './dto/guest-response.dto';
import { WishResponseDto } from './dto/wish-response.dto';
import { StatsResponseDto } from './dto/stats-response.dto';
import { GetWishesQueryDto } from './dto/get-wishes-query.dto';

function generateInviteToken(): string {
  return randomBytes(16).toString('hex');
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private toGuestDto(g: {
    id: string;
    displayName: string | null;
    name: string | null;
    attending: boolean | null;
    attendeeCount: number | null;
    createdAt: Date;
    rsvpAt: Date | null;
    inviteToken: string | null;
    wish?: { message: string } | null;
  }): GuestResponseDto {
    return {
      id: g.id,
      displayName: g.displayName ?? undefined,
      name: g.name ?? undefined,
      attending: g.attending ?? undefined,
      attendeeCount: g.attendeeCount ?? undefined,
      createdAt: g.createdAt,
      rsvpAt: g.rsvpAt ?? undefined,
      inviteToken: g.inviteToken ?? undefined,
      wishMessage: g.wish?.message,
    };
  }

  async getGuests(query: GetGuestsQueryDto): Promise<GuestListResponseDto> {
    const { page = 1, limit = 50, search, attending, status, sort = 'created' } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { displayName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(attending !== undefined && { attending }),
      ...(status === 'pending' && { rsvpAt: null }),
      ...(status === 'attending' && { rsvpAt: { not: null }, attending: true }),
      ...(status === 'declined' && { rsvpAt: { not: null }, attending: false }),
      ...(status === 'responded' && { rsvpAt: { not: null } }),
    };

    const [guests, total] = await this.prisma.$transaction([
      this.prisma.guest.findMany({
        where,
        select: {
          id: true,
          displayName: true,
          name: true,
          attending: true,
          attendeeCount: true,
          createdAt: true,
          rsvpAt: true,
          inviteToken: true,
          wish: { select: { message: true } },
        },
        skip,
        take: limit,
        orderBy:
          sort === 'rsvp'
            ? [{ rsvpAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }]
            : { createdAt: 'desc' },
      }),
      this.prisma.guest.count({ where }),
    ]);

    return {
      data: guests.map((g) => this.toGuestDto(g)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createGuest(dto: CreateGuestDto): Promise<GuestResponseDto> {
    let inviteToken = generateInviteToken();
    let attempts = 0;

    while (attempts < 5) {
      try {
        const guest = await this.prisma.guest.create({
          data: {
            displayName: dto.displayName.trim(),
            inviteToken,
          },
          select: {
            id: true,
            displayName: true,
            name: true,
            attending: true,
            attendeeCount: true,
            createdAt: true,
            rsvpAt: true,
            inviteToken: true,
            wish: { select: { message: true } },
          },
        });
        return this.toGuestDto(guest);
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          (error as { code: string }).code === 'P2002'
        ) {
          inviteToken = generateInviteToken();
          attempts++;
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException('ไม่สามารถสร้างลิงก์เชิญได้ กรุณาลองใหม่');
  }

  async updateGuest(id: string, dto: UpdateGuestDto): Promise<GuestResponseDto> {
    const existing = await this.prisma.guest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('ไม่พบแขก');
    }

    const guest = await this.prisma.guest.update({
      where: { id },
      data: { displayName: dto.displayName.trim() },
      select: {
        id: true,
        displayName: true,
        name: true,
        attending: true,
        attendeeCount: true,
        createdAt: true,
        rsvpAt: true,
        inviteToken: true,
        wish: { select: { message: true } },
      },
    });

    return this.toGuestDto(guest);
  }

  async deleteGuest(id: string): Promise<void> {
    const existing = await this.prisma.guest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('ไม่พบแขก');
    }
    if (existing.rsvpAt) {
      throw new BadRequestException('ไม่สามารถลบแขกที่ตอบรับแล้วได้');
    }
    await this.prisma.guest.delete({ where: { id } });
  }

  async getStats(): Promise<StatsResponseDto> {
    const [attending, declined, totalWishes, pendingInvites, attendeeSum] =
      await this.prisma.$transaction([
        this.prisma.guest.count({ where: { attending: true } }),
        this.prisma.guest.count({ where: { attending: false } }),
        this.prisma.wish.count(),
        this.prisma.guest.count({ where: { rsvpAt: null } }),
        this.prisma.guest.aggregate({
          where: { attending: true, attendeeCount: { not: null } },
          _sum: { attendeeCount: true },
        }),
      ]);

    return {
      attending,
      declined,
      totalWishes,
      totalGuests: attending + declined,
      pendingInvites,
      totalAttendees: attendeeSum._sum.attendeeCount ?? 0,
    };
  }

  async getWishes(query: GetWishesQueryDto = {}): Promise<WishResponseDto[]> {
    const wishes = await this.prisma.wish.findMany({
      select: {
        id: true,
        message: true,
        createdAt: true,
        guest: { select: { name: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
      ...(query.limit !== undefined && { take: query.limit }),
    });

    return wishes.map((w) => ({
      id: w.id,
      message: w.message,
      guestName: w.guest.name ?? w.guest.displayName ?? 'ไม่ระบุชื่อ',
      createdAt: w.createdAt,
    }));
  }
}
