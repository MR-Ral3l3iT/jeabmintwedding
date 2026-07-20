import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { GuestCategoryDto } from './create-guest.dto';

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
    enum: GuestCategoryDto,
    description: 'ประเภทแขก',
  })
  @IsOptional()
  @IsEnum(GuestCategoryDto, { message: 'กรุณาเลือกประเภทแขก' })
  category?: GuestCategoryDto;
}
