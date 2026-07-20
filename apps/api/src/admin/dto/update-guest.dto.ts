import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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
    description: 'รหัสประเภทแขก',
  })
  @IsOptional()
  @IsString({ message: 'กรุณาเลือกประเภทแขก' })
  @IsNotEmpty({ message: 'กรุณาเลือกประเภทแขก' })
  categoryId?: string;
}
