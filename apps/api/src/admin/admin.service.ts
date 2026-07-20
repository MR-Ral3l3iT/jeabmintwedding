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
import {
  CreateGuestCategoryDto,
  GuestCategoryResponseDto,
  UpdateGuestCategoryDto,
} from './dto/guest-category.dto';

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
    categoryId: string | null;
    attending: boolean | null;
    attendeeCount: number | null;
    createdAt: Date;
    rsvpAt: Date | null;
    inviteToken: string | null;
    category?: { name: string } | null;
    wish?: { message: string } | null;
  }): GuestResponseDto {
    return {
      id: g.id,
      displayName: g.displayName ?? undefined,
      name: g.name ?? undefined,
      categoryId: g.categoryId ?? undefined,
      categoryName: g.category?.name,
      attending: g.attending ?? undefined,
      attendeeCount: g.attendeeCount ?? undefined,
      createdAt: g.createdAt,
      rsvpAt: g.rsvpAt ?? undefined,
      inviteToken: g.inviteToken ?? undefined,
      wishMessage: g.wish?.message,
    };
  }

  private guestSelect = {
    id: true,
    displayName: true,
    name: true,
    categoryId: true,
    attending: true,
    attendeeCount: true,
    createdAt: true,
    rsvpAt: true,
    inviteToken: true,
    category: { select: { name: true } },
    wish: { select: { message: true } },
  } as const;

  private toCategoryDto(row: {
    id: string;
    name: string;
    sortOrder: number;
    createdAt: Date;
  }): GuestCategoryResponseDto {
    return {
      id: row.id,
      name: row.name,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
    };
  }

  async getGuestCategories(): Promise<GuestCategoryResponseDto[]> {
    const rows = await this.prisma.guestCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((row) => this.toCategoryDto(row));
  }

  async createGuestCategory(dto: CreateGuestCategoryDto): Promise<GuestCategoryResponseDto> {
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('กรุณากรอกชื่อประเภทแขก');
    }

    const maxOrder = await this.prisma.guestCategory.aggregate({
      _max: { sortOrder: true },
    });

    const row = await this.prisma.guestCategory.create({
      data: {
        name,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    return this.toCategoryDto(row);
  }

  async updateGuestCategory(
    id: string,
    dto: UpdateGuestCategoryDto,
  ): Promise<GuestCategoryResponseDto> {
    const existing = await this.prisma.guestCategory.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('ไม่พบประเภทแขก');
    }

    const row = await this.prisma.guestCategory.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });

    return this.toCategoryDto(row);
  }

  async deleteGuestCategory(id: string): Promise<void> {
    const existing = await this.prisma.guestCategory.findUnique({
      where: { id },
      include: { _count: { select: { guests: true } } },
    });
    if (!existing) {
      throw new NotFoundException('ไม่พบประเภทแขก');
    }
    if (existing._count.guests > 0) {
      throw new BadRequestException(
        `ไม่สามารถลบได้ เพราะมีแขก ${existing._count.guests} รายการใช้ประเภทนี้อยู่`,
      );
    }
    await this.prisma.guestCategory.delete({ where: { id } });
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const found = await this.prisma.guestCategory.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!found) {
      throw new BadRequestException('ไม่พบประเภทแขกที่เลือก');
    }
  }

  async getGuests(query: GetGuestsQueryDto): Promise<GuestListResponseDto> {
    const {
      page = 1,
      limit = 50,
      search,
      attending,
      status,
      categoryId,
      sort = 'created',
    } = query;
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
      ...(categoryId && { categoryId }),
    };

    const [guests, total] = await this.prisma.$transaction([
      this.prisma.guest.findMany({
        where,
        select: this.guestSelect,
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
    await this.assertCategoryExists(dto.categoryId);

    let inviteToken = generateInviteToken();
    let attempts = 0;

    while (attempts < 5) {
      try {
        const guest = await this.prisma.guest.create({
          data: {
            displayName: dto.displayName.trim(),
            categoryId: dto.categoryId,
            inviteToken,
          },
          select: this.guestSelect,
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

    if (dto.categoryId !== undefined) {
      await this.assertCategoryExists(dto.categoryId);
    }

    const guest = await this.prisma.guest.update({
      where: { id },
      data: {
        ...(dto.displayName !== undefined && { displayName: dto.displayName.trim() }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      },
      select: this.guestSelect,
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
