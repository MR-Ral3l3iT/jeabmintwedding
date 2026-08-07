import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartySide } from '@prisma/client';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LineFriendResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  lineUserId: string;

  @ApiPropertyOptional()
  displayName?: string;

  @ApiPropertyOptional()
  pictureUrl?: string;

  @ApiProperty()
  followedAt: Date;

  @ApiPropertyOptional()
  unfollowedAt?: Date;

  @ApiPropertyOptional()
  guestId?: string;

  @ApiPropertyOptional()
  guestDisplayName?: string;

  @ApiPropertyOptional({ description: 'ชื่อเรียกในงานของแขกที่ผูก' })
  guestName?: string;

  @ApiPropertyOptional({ enum: PartySide, description: 'ฝั่งของแขกที่ผูก' })
  guestPartySide?: PartySide;

  @ApiProperty()
  isFollowing: boolean;
}

export class GetLineFriendsQueryDto {
  @ApiPropertyOptional({ enum: ['all', 'linked', 'unlinked'] })
  @IsOptional()
  @IsIn(['all', 'linked', 'unlinked'])
  linked?: 'all' | 'linked' | 'unlinked';
}

export class LinkLineFriendDto {
  @ApiProperty({ description: 'Guest id to link' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาเลือกแขก' })
  guestId: string;
}
