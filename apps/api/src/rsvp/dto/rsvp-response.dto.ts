import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RsvpResponseDto {
  @ApiProperty()
  guestId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  attending: boolean;

  @ApiPropertyOptional({ description: 'จำนวนผู้มางาน' })
  attendeeCount?: number;

  @ApiPropertyOptional()
  wishId?: string;
}
