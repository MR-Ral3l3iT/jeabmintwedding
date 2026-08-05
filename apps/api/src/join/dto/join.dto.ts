import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartySide } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class JoinGuestResponseDto {
  @ApiPropertyOptional()
  displayName?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ enum: PartySide })
  partySide?: PartySide;

  @ApiProperty()
  inviteToken: string;
}

export class SubmitJoinDto {
  @ApiProperty({ description: 'ชื่อเรียกในงาน', example: 'เจี๊ยบ', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อเรียกในงาน' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: PartySide, description: 'ฝั่งเจ้าบ่าวหรือเจ้าสาว' })
  @IsEnum(PartySide, { message: 'กรุณาเลือกฝั่งเจ้าบ่าวหรือเจ้าสาว' })
  partySide: PartySide;

  @ApiPropertyOptional({
    description: 'โทเค็นแขกที่มีอยู่แล้ว (ออนไลน์ / การ์ดรายบุคคล)',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  token?: string;
}

export class SubmitJoinResponseDto {
  @ApiProperty()
  inviteToken: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: PartySide })
  partySide: PartySide;

  @ApiProperty({ description: 'ลิงก์เพิ่ม LINE OA' })
  lineOaUrl: string;
}
