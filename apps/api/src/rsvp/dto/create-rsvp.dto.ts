import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRsvpDto {
  @ApiProperty({ description: 'ชื่อแขก', example: 'สมชาย ใจดี', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'เข้าร่วมงานหรือไม่', example: true })
  @IsBoolean()
  attending: boolean;

  @ApiPropertyOptional({
    description: 'จำนวนผู้มางาน (เมื่อเข้าร่วม)',
    example: 2,
    minimum: 1,
    maximum: 20,
  })
  @ValidateIf((o) => o.attending === true)
  @Type(() => Number)
  @IsInt({ message: 'จำนวนผู้มางานต้องเป็นตัวเลข' })
  @Min(1, { message: 'จำนวนผู้มางานต้องอย่างน้อย 1 คน' })
  @Max(20, { message: 'จำนวนผู้มางานเกิน 20 คน' })
  attendeeCount?: number;

  @ApiPropertyOptional({
    description: 'คำอวยพร (เฉพาะคนที่ไม่มา)',
    example: 'ขอให้มีความสุขมากๆ นะคะ',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  wish?: string;

  @ApiPropertyOptional({
    description: 'โทเค็นลิงก์เชิญ (ถ้ามาจากลิงก์ส่วนตัว)',
    example: 'a1b2c3d4e5f6...',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  inviteToken?: string;
}
