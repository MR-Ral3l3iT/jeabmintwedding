import { ApiProperty } from '@nestjs/swagger';

export class StatsResponseDto {
  @ApiProperty({ description: 'จำนวนแขกที่เข้าร่วม' })
  attending: number;

  @ApiProperty({ description: 'จำนวนแขกที่ไม่สะดวก' })
  declined: number;

  @ApiProperty({ description: 'จำนวนการ์ดอวยพรทั้งหมด' })
  totalWishes: number;

  @ApiProperty({ description: 'จำนวนแขกทั้งหมดที่ตอบรับแล้ว' })
  totalGuests: number;

  @ApiProperty({ description: 'จำนวนเชิญที่ยังไม่ตอบรับ' })
  pendingInvites: number;

  @ApiProperty({ description: 'จำนวนคนมางานรวม (รวมผู้ติดตาม)' })
  totalAttendees: number;
}
