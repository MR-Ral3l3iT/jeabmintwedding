import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InviteLocale } from '@prisma/client';

export class InviteResponseDto {
  @ApiProperty({ description: 'ชื่อที่แสดงบนการ์ดเชิญ' })
  displayName: string;

  @ApiProperty({ description: 'ตอบ RSVP แล้วหรือยัง' })
  hasRsvp: boolean;

  @ApiProperty({ enum: InviteLocale, description: 'ภาษาการ์ดเชิญ' })
  locale: InviteLocale;

  @ApiPropertyOptional({ description: 'เข้าร่วมงานหรือไม่ (ถ้าตอบแล้ว)' })
  attending?: boolean;
}
