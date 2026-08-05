import { ApiPropertyOptional } from '@nestjs/swagger';
import { InviteLocale, PartySide } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGuestDto {
  @ApiPropertyOptional({
    description: 'ชื่อที่แสดงบนการ์ดเชิญ',
    example: 'คุณสมหญิง',
    maxLength: 150,
  })
  @IsOptional()
  @IsString({ message: 'กรุณากรอกชื่อบนการ์ด' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อบนการ์ด' })
  @MaxLength(150, { message: 'ชื่อยาวเกิน 150 ตัวอักษร' })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'ชื่อเรียกในงาน',
    example: 'เจี๊ยบ',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'กรุณากรอกชื่อเรียกในงาน' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อเรียกในงาน' })
  @MaxLength(100, { message: 'ชื่อยาวเกิน 100 ตัวอักษร' })
  name?: string;

  @ApiPropertyOptional({
    enum: PartySide,
    description: 'ฝั่งเจ้าบ่าวหรือเจ้าสาว',
  })
  @IsOptional()
  @IsEnum(PartySide, { message: 'กรุณาเลือกฝั่งเจ้าบ่าวหรือเจ้าสาว' })
  partySide?: PartySide;

  @ApiPropertyOptional({
    enum: InviteLocale,
    description: 'ภาษาการ์ดเชิญ',
  })
  @IsOptional()
  @IsEnum(InviteLocale, { message: 'กรุณาเลือกภาษาการ์ด' })
  locale?: InviteLocale;

  @ApiPropertyOptional({
    description: 'รหัสประเภทแขก',
  })
  @IsOptional()
  @IsString({ message: 'กรุณาเลือกประเภทแขก' })
  @IsNotEmpty({ message: 'กรุณาเลือกประเภทแขก' })
  categoryId?: string;
}
