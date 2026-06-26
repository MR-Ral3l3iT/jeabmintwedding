import { ApiProperty } from '@nestjs/swagger';

export class WishResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  guestName: string;

  @ApiProperty()
  createdAt: Date;
}
