import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GuestResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  displayName?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  attending?: boolean;

  @ApiPropertyOptional({ description: 'จำนวนผู้มางาน' })
  attendeeCount?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  rsvpAt?: Date;

  @ApiPropertyOptional()
  inviteToken?: string;

  @ApiPropertyOptional()
  wishMessage?: string;
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
