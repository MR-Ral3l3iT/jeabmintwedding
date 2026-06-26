import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { InviteResponseDto } from './dto/invite-response.dto';

@Injectable()
export class InviteService {
  constructor(private readonly prisma: PrismaService) {}

  async getByToken(token: string): Promise<InviteResponseDto> {
    const guest = await this.prisma.guest.findUnique({
      where: { inviteToken: token },
      select: {
        displayName: true,
        rsvpAt: true,
        attending: true,
      },
    });

    if (!guest?.displayName) {
      throw new NotFoundException('ไม่พบลิงก์เชิญนี้');
    }

    return {
      displayName: guest.displayName,
      hasRsvp: guest.rsvpAt !== null,
      ...(guest.rsvpAt !== null && guest.attending !== null && {
        attending: guest.attending,
      }),
    };
  }
}
