import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InviteLocale } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGuestDto {
  @ApiProperty({
    description: 'ชื่อที่แสดงบนการ์ดเชิญ',
    example: 'คุณสมชาย และครอบครัว',
    maxLength: 150,
  })
  @IsString({ message: 'กรุณากรอกชื่อบนการ์ด' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อบนการ์ด' })
  @MaxLength(150, { message: 'ชื่อยาวเกิน 150 ตัวอักษร' })
  displayName: string;

  @ApiProperty({
    description: 'รหัสประเภทแขก',
    example: 'GROOM_FRIEND',
  })
  @IsString({ message: 'กรุณาเลือกประเภทแขก' })
  @IsNotEmpty({ message: 'กรุณาเลือกประเภทแขก' })
  categoryId: string;

  @ApiPropertyOptional({
    enum: InviteLocale,
    description: 'ภาษาการ์ดเชิญ',
    default: InviteLocale.TH,
  })
  @IsOptional()
  @IsEnum(InviteLocale, { message: 'กรุณาเลือกภาษาการ์ด' })
  locale?: InviteLocale;
}
