import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateSeatingGroupDto,
  SeatingGroupResponseDto,
  SeatingGuestBriefDto,
  SeatingPlanResponseDto,
  SeatingSpotResponseDto,
  SetTableGuestsDto,
  SetTableGroupDto,
  SetTablesGroupDto,
  UpdateSeatingGroupDto,
} from './dto/seating.dto';

const GROUP_COLORS = [
  '#6b7c5e',
  '#8B5E3C',
  '#5D7A8C',
  '#A67C52',
  '#7A6B8A',
  '#6B8F71',
  '#9A6B5A',
  '#4F6F8F',
  '#C45C26',
  '#2F6B5A',
  '#8C4A6B',
  '#5A6B2F',
  '#6B4F3A',
  '#3A5A8C',
  '#A35D6A',
  '#4A7A6B',
];

const tableInclude = {
  group: {
    include: { guestCategory: { select: { name: true } } },
  },
  guests: {
    include: {
      guest: {
        select: {
          id: true,
          displayName: true,
          name: true,
          categoryId: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

const groupInclude = {
  guestCategory: { select: { name: true } },
  tables: { where: { kind: 'TABLE' as const }, select: { code: true } },
};

@Injectable()
export class SeatingService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlan(): Promise<SeatingPlanResponseDto> {
    await this.syncGroupsFromCategories();

    const [tables, groups, assignedGuestIds] = await Promise.all([
      this.prisma.seatingTable.findMany({
        include: tableInclude,
        orderBy: [{ kind: 'asc' }, { code: 'asc' }],
      }),
      this.prisma.seatingGroup.findMany({
        include: groupInclude,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.seatingTableGuest.findMany({ select: { guestId: true } }),
    ]);

    const assigned = new Set(assignedGuestIds.map((r) => r.guestId));
    const unassignedRows = await this.prisma.guest.findMany({
      where: {
        id: { notIn: [...assigned] },
        OR: [{ attending: true }, { attending: null }],
      },
      select: {
        id: true,
        displayName: true,
        name: true,
        categoryId: true,
        category: { select: { name: true } },
      },
      orderBy: [{ displayName: 'asc' }, { name: 'asc' }],
      take: 500,
    });

    return {
      spots: tables.map((t) => this.toSpotDto(t)),
      groups: groups.map((g) => this.toGroupDto(g)),
      unassignedGuests: unassignedRows.map((g) => this.toGuestBrief(g)),
    };
  }

  async listGroups(): Promise<SeatingGroupResponseDto[]> {
    await this.syncGroupsFromCategories();
    const groups = await this.prisma.seatingGroup.findMany({
      include: groupInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return groups.map((g) => this.toGroupDto(g));
  }

  async createCustomGroup(dto: CreateSeatingGroupDto): Promise<SeatingGroupResponseDto> {
    const name = dto.customName.trim();
    const shortName = dto.shortName.trim();
    if (!name) throw new BadRequestException('กรุณากรอกชื่อกลุ่ม');
    if (!shortName) throw new BadRequestException('กรุณากรอกชื่อย่อ');

    const count = await this.prisma.seatingGroup.count();
    const color = dto.color?.trim() || (await this.nextUniqueColor());
    const row = await this.prisma.seatingGroup.create({
      data: {
        customName: name,
        shortName,
        color,
        sortOrder: 100 + count,
      },
      include: groupInclude,
    });
    return this.toGroupDto(row);
  }

  async updateGroup(id: string, dto: UpdateSeatingGroupDto): Promise<SeatingGroupResponseDto> {
    const existing = await this.prisma.seatingGroup.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('ไม่พบกลุ่ม');

    if (existing.guestCategoryId && dto.customName !== undefined) {
      throw new BadRequestException('กลุ่มจากประเภทการ์ดแก้ชื่อเต็มไม่ได้ — แก้ที่ประเภทแขกแทน');
    }

    const row = await this.prisma.seatingGroup.update({
      where: { id },
      data: {
        ...(dto.customName !== undefined && { customName: dto.customName.trim() }),
        ...(dto.shortName !== undefined && { shortName: dto.shortName.trim() }),
        ...(dto.color !== undefined && { color: dto.color.trim() }),
      },
      include: groupInclude,
    });
    return this.toGroupDto(row);
  }

  async setTableGroup(code: string, dto: SetTableGroupDto): Promise<SeatingSpotResponseDto> {
    const spots = await this.setTablesGroup({
      codes: [code],
      groupId: dto.groupId,
    });
    return spots[0];
  }

  async setTablesGroup(dto: SetTablesGroupDto): Promise<SeatingSpotResponseDto[]> {
    const codes = [...new Set(dto.codes.map((c) => c.trim()).filter(Boolean))];
    if (!codes.length) throw new BadRequestException('กรุณาเลือกโต๊ะอย่างน้อย 1 ตัว');

    const tables = await this.prisma.seatingTable.findMany({
      where: { code: { in: codes } },
    });
    if (tables.length !== codes.length) {
      throw new NotFoundException('พบรหัสโต๊ะที่ไม่มีในผัง');
    }
    if (tables.some((t) => t.kind !== 'TABLE')) {
      throw new BadRequestException('เลือกได้เฉพาะโต๊ะนั่ง');
    }

    const groupId = dto.groupId?.trim() || null;
    if (groupId) {
      const group = await this.prisma.seatingGroup.findUnique({ where: { id: groupId } });
      if (!group) throw new NotFoundException('ไม่พบกลุ่ม');
    }

    await this.prisma.seatingTable.updateMany({
      where: { code: { in: codes } },
      data: { groupId },
    });

    const updated = await this.prisma.seatingTable.findMany({
      where: { code: { in: codes } },
      include: tableInclude,
      orderBy: { code: 'asc' },
    });
    return updated.map((t) => this.toSpotDto(t));
  }

  async setTableGuests(code: string, dto: SetTableGuestsDto): Promise<SeatingSpotResponseDto> {
    const table = await this.requireTable(code);
    if (table.kind !== 'TABLE') {
      throw new BadRequestException('จุดนี้ไม่ใช่โต๊ะนั่ง');
    }

    const guestIds = [...new Set(dto.guestIds.map((id) => id.trim()).filter(Boolean))];
    if (guestIds.length) {
      const found = await this.prisma.guest.findMany({
        where: { id: { in: guestIds } },
        select: { id: true },
      });
      if (found.length !== guestIds.length) {
        throw new BadRequestException('พบ guest id ที่ไม่มีในระบบ');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      if (guestIds.length) {
        await tx.seatingTableGuest.deleteMany({
          where: { guestId: { in: guestIds } },
        });
      }
      await tx.seatingTableGuest.deleteMany({ where: { tableId: table.id } });
      if (guestIds.length) {
        await tx.seatingTableGuest.createMany({
          data: guestIds.map((guestId) => ({ tableId: table.id, guestId })),
        });
      }
    });

    const updated = await this.prisma.seatingTable.findUniqueOrThrow({
      where: { id: table.id },
      include: tableInclude,
    });
    return this.toSpotDto(updated);
  }

  async searchGuestsForAssign(params: {
    search?: string;
    categoryId?: string;
  }): Promise<SeatingGuestBriefDto[]> {
    const search = params.search?.trim();
    const rows = await this.prisma.guest.findMany({
      where: {
        ...(params.categoryId ? { categoryId: params.categoryId } : {}),
        ...(search
          ? {
              OR: [
                { displayName: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        displayName: true,
        name: true,
        categoryId: true,
        category: { select: { name: true } },
        seatingTable: { select: { table: { select: { code: true } } } },
      },
      orderBy: [{ displayName: 'asc' }, { name: 'asc' }],
      take: 80,
    });

    return rows.map((g) => ({
      ...this.toGuestBrief(g),
      categoryName: g.seatingTable?.table.code
        ? `${g.category?.name ?? 'ยังไม่ระบุ'} · โต๊ะ ${g.seatingTable.table.code}`
        : (g.category?.name ?? undefined),
    }));
  }

  async buildBotKnowledgeSummary(guestId?: string | null): Promise<string> {
    const tables = await this.prisma.seatingTable.findMany({
      where: { kind: 'TABLE' },
      include: {
        group: { include: { guestCategory: { select: { name: true } } } },
        guests: {
          include: {
            guest: { select: { id: true, displayName: true, name: true } },
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    const lines: string[] = ['แผนที่นั่งโต๊ะอาหาร:'];
    for (const t of tables) {
      const groupName =
        t.group?.guestCategory?.name ?? t.group?.customName ?? null;
      const people = t.guests
        .map((g) => g.guest.displayName ?? g.guest.name)
        .filter(Boolean);
      if (!groupName && people.length === 0) continue;
      const parts = [
        groupName ? `กลุ่ม ${groupName}` : null,
        people.length ? `แขก: ${people.join(', ')}` : null,
      ].filter(Boolean);
      lines.push(`- โต๊ะ ${t.code}: ${parts.join(' · ')}`);
    }

    if (guestId) {
      const mine = await this.prisma.seatingTableGuest.findUnique({
        where: { guestId },
        include: {
          table: {
            include: {
              group: { include: { guestCategory: { select: { name: true } } } },
            },
          },
          guest: { select: { displayName: true, name: true } },
        },
      });
      if (mine) {
        const label = mine.guest.displayName ?? mine.guest.name ?? 'คุณ';
        const gName =
          mine.table.group?.guestCategory?.name ??
          mine.table.group?.customName ??
          '';
        lines.push(
          `โต๊ะของ ${label}: ${mine.table.code}${gName ? ` (กลุ่ม ${gName})` : ''}`,
        );
      } else {
        const guest = await this.prisma.guest.findUnique({
          where: { id: guestId },
          select: {
            displayName: true,
            name: true,
            categoryId: true,
            category: { select: { name: true } },
          },
        });
        if (guest?.categoryId) {
          const group = await this.prisma.seatingGroup.findUnique({
            where: { guestCategoryId: guest.categoryId },
            include: {
              tables: { where: { kind: 'TABLE' }, select: { code: true } },
            },
          });
          if (group?.tables.length) {
            const label = guest.displayName ?? guest.name ?? 'คุณ';
            lines.push(
              `โต๊ะโดยประมาณของ ${label} (ตามประเภทการ์ด ${guest.category?.name}): ${group.tables.map((t) => t.code).join(', ')} — ยังไม่ได้ระบุชื่อลงโต๊ะเป็นรายคน`,
            );
          }
        }
      }
    }

    return lines.length > 1 ? lines.join('\n') : '';
  }

  private async syncGroupsFromCategories(): Promise<void> {
    const categories = await this.prisma.guestCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    const usedColors = new Set(
      (await this.prisma.seatingGroup.findMany({ select: { color: true } })).map(
        (g) => g.color.toLowerCase(),
      ),
    );

    for (const cat of categories) {
      const existing = await this.prisma.seatingGroup.findUnique({
        where: { guestCategoryId: cat.id },
      });
      if (existing) {
        await this.prisma.seatingGroup.update({
          where: { id: existing.id },
          data: {
            sortOrder: cat.sortOrder,
            ...(!existing.shortName?.trim()
              ? { shortName: this.defaultShortName(cat.name) }
              : {}),
          },
        });
        continue;
      }

      const color = this.pickUnusedColor(usedColors);
      usedColors.add(color.toLowerCase());
      await this.prisma.seatingGroup.create({
        data: {
          guestCategoryId: cat.id,
          shortName: this.defaultShortName(cat.name),
          color,
          sortOrder: cat.sortOrder,
        },
      });
    }
  }

  private async nextUniqueColor(): Promise<string> {
    const used = new Set(
      (await this.prisma.seatingGroup.findMany({ select: { color: true } })).map(
        (g) => g.color.toLowerCase(),
      ),
    );
    return this.pickUnusedColor(used);
  }

  private pickUnusedColor(used: Set<string>): string {
    for (const color of GROUP_COLORS) {
      if (!used.has(color.toLowerCase())) return color;
    }
    // Fallback: spaced HSL hues
    for (let i = 0; i < 36; i++) {
      const hue = (i * 37) % 360;
      const color = this.hslToHex(hue, 42, 42);
      if (!used.has(color.toLowerCase())) return color;
    }
    return `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')}`;
  }

  private hslToHex(h: number, s: number, l: number): string {
    const sat = s / 100;
    const lig = l / 100;
    const a = sat * Math.min(lig, 1 - lig);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = lig - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  private defaultShortName(fullName: string): string {
    const trimmed = fullName.trim();
    return trimmed.slice(0, 4) || 'กลุ่ม';
  }

  private async requireTable(code: string) {
    const table = await this.prisma.seatingTable.findUnique({ where: { code } });
    if (!table) throw new NotFoundException(`ไม่พบโต๊ะ ${code}`);
    return table;
  }

  private toGuestBrief(g: {
    id: string;
    displayName: string | null;
    name: string | null;
    categoryId: string | null;
    category?: { name: string } | null;
  }): SeatingGuestBriefDto {
    return {
      id: g.id,
      displayName: g.displayName ?? g.name ?? 'ไม่ระบุชื่อ',
      categoryId: g.categoryId ?? undefined,
      categoryName: g.category?.name,
    };
  }

  private toSpotDto(t: {
    id: string;
    code: string;
    kind: 'TABLE' | 'FACILITY';
    label: string | null;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
    groupId: string | null;
    group?: {
      id: string;
      customName: string | null;
      shortName: string;
      color: string;
      guestCategory?: { name: string } | null;
    } | null;
    guests: {
      guest: {
        id: string;
        displayName: string | null;
        name: string | null;
        categoryId: string | null;
        category?: { name: string } | null;
      };
    }[];
  }): SeatingSpotResponseDto {
    return {
      id: t.id,
      code: t.code,
      kind: t.kind,
      label: t.label ?? undefined,
      xPercent: t.xPercent,
      yPercent: t.yPercent,
      widthPercent: t.widthPercent,
      heightPercent: t.heightPercent,
      groupId: t.groupId ?? undefined,
      groupName:
        t.group?.guestCategory?.name ?? t.group?.customName ?? undefined,
      groupShortName: t.group?.shortName,
      groupColor: t.group?.color,
      guests: t.guests.map((row) => this.toGuestBrief(row.guest)),
    };
  }

  private toGroupDto(g: {
    id: string;
    guestCategoryId: string | null;
    customName: string | null;
    shortName: string;
    color: string;
    sortOrder: number;
    guestCategory?: { name: string } | null;
    tables: { code: string }[];
  }): SeatingGroupResponseDto {
    return {
      id: g.id,
      name: g.guestCategory?.name ?? g.customName ?? 'ไม่มีชื่อ',
      shortName: g.shortName,
      guestCategoryId: g.guestCategoryId ?? undefined,
      customName: g.customName ?? undefined,
      color: g.color,
      sortOrder: g.sortOrder,
      tableCodes: g.tables.map((t) => t.code).sort(),
    };
  }
}
