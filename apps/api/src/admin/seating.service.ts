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
];

@Injectable()
export class SeatingService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlan(): Promise<SeatingPlanResponseDto> {
    await this.syncGroupsFromCategories();

    const [tables, groups, assignedGuestIds] = await Promise.all([
      this.prisma.seatingTable.findMany({
        include: {
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
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: [{ kind: 'asc' }, { code: 'asc' }],
      }),
      this.prisma.seatingGroup.findMany({
        include: {
          guestCategory: { select: { name: true } },
          tables: { where: { kind: 'TABLE' }, select: { code: true } },
        },
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
      include: {
        guestCategory: { select: { name: true } },
        tables: { where: { kind: 'TABLE' }, select: { code: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return groups.map((g) => this.toGroupDto(g));
  }

  async createCustomGroup(dto: CreateSeatingGroupDto): Promise<SeatingGroupResponseDto> {
    const name = dto.customName.trim();
    if (!name) throw new BadRequestException('กรุณากรอกชื่อกลุ่ม');

    const count = await this.prisma.seatingGroup.count();
    const row = await this.prisma.seatingGroup.create({
      data: {
        customName: name,
        color: dto.color?.trim() || GROUP_COLORS[count % GROUP_COLORS.length],
        sortOrder: 100 + count,
      },
      include: {
        guestCategory: { select: { name: true } },
        tables: { where: { kind: 'TABLE' }, select: { code: true } },
      },
    });
    return this.toGroupDto(row);
  }

  async setTableGroup(code: string, dto: SetTableGroupDto): Promise<SeatingSpotResponseDto> {
    const table = await this.requireTable(code);
    if (table.kind !== 'TABLE') {
      throw new BadRequestException('จุดนี้ไม่ใช่โต๊ะนั่ง');
    }

    const groupId = dto.groupId?.trim() || null;
    if (groupId) {
      const group = await this.prisma.seatingGroup.findUnique({ where: { id: groupId } });
      if (!group) throw new NotFoundException('ไม่พบกลุ่ม');
    }

    const updated = await this.prisma.seatingTable.update({
      where: { id: table.id },
      data: { groupId },
      include: {
        group: { include: { guestCategory: { select: { name: true } } } },
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
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return this.toSpotDto(updated);
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
      // ย้ายแขกที่อยู่โต๊ะอื่นออกก่อน แล้วใส่ชุดใหม่บนโต๊ะนี้
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
      include: {
        group: { include: { guestCategory: { select: { name: true } } } },
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
          orderBy: { createdAt: 'asc' },
        },
      },
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
      // surface current table in categoryName suffix via display for UI — keep DTO lean
      categoryName: g.seatingTable?.table.code
        ? `${g.category?.name ?? 'ยังไม่ระบุ'} · โต๊ะ ${g.seatingTable.table.code}`
        : (g.category?.name ?? undefined),
    }));
  }

  /** สรุปแผนที่นั่งสั้น ๆ สำหรับบอท */
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
        // fallback: guest's card category → tables with that group
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
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      await this.prisma.seatingGroup.upsert({
        where: { guestCategoryId: cat.id },
        update: { sortOrder: cat.sortOrder },
        create: {
          guestCategoryId: cat.id,
          color: GROUP_COLORS[i % GROUP_COLORS.length],
          sortOrder: cat.sortOrder,
        },
      });
    }
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
      groupColor: t.group?.color,
      guests: t.guests.map((row) => this.toGuestBrief(row.guest)),
    };
  }

  private toGroupDto(g: {
    id: string;
    guestCategoryId: string | null;
    customName: string | null;
    color: string;
    sortOrder: number;
    guestCategory?: { name: string } | null;
    tables: { code: string }[];
  }): SeatingGroupResponseDto {
    return {
      id: g.id,
      name: g.guestCategory?.name ?? g.customName ?? 'ไม่มีชื่อ',
      guestCategoryId: g.guestCategoryId ?? undefined,
      customName: g.customName ?? undefined,
      color: g.color,
      sortOrder: g.sortOrder,
      tableCodes: g.tables.map((t) => t.code).sort(),
    };
  }
}
