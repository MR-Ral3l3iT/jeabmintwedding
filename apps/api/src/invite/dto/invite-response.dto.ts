import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteResponseDto {
  @ApiProperty({ description: 'ชื่อที่แสดงบนการ์ดเชิญ' })
  displayName: string;

  @ApiProperty({ description: 'ตอบ RSVP แล้วหรือยัง' })
  hasRsvp: boolean;

  @ApiPropertyOptional({ description: 'เข้าร่วมงานหรือไม่ (ถ้าตอบแล้ว)' })
  attending?: boolean;
}
