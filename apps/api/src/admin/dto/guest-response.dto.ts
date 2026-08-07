import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartySide } from '@prisma/client';

export class GuestResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  displayName?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'จำนวนผู้มางาน' })
  attendeeCount?: number;

  @ApiPropertyOptional({ description: 'รหัสประเภทแขก' })
  categoryId?: string;

  @ApiPropertyOptional({ description: 'ชื่อประเภทแขก' })
  categoryName?: string;

  @ApiPropertyOptional({ enum: PartySide, description: 'ฝั่งเจ้าบ่าว/เจ้าสาว' })
  partySide?: PartySide;

  @ApiPropertyOptional({ enum: ['TH', 'EN'], description: 'ภาษาการ์ดเชิญ' })
  locale?: 'TH' | 'EN';

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  rsvpAt?: Date;

  @ApiPropertyOptional()
  inviteToken?: string;

  @ApiPropertyOptional({ description: 'LINE User ID เมื่อเชื่อมแล้ว' })
  lineUserId?: string;

  @ApiPropertyOptional()
  wishMessage?: string;

  @ApiPropertyOptional()
  attending?: boolean;
}

export class GuestListResponseDto {
  @ApiProperty({ type: [GuestResponseDto] })
  data: GuestResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
