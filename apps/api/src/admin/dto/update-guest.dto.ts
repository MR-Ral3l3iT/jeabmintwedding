import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateGuestDto {
  @ApiProperty({
    description: 'ชื่อที่แสดงบนการ์ดเชิญ',
    example: 'คุณสมหญิง',
    maxLength: 150,
  })
  @IsString({ message: 'กรุณากรอกชื่อบนการ์ด' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อบนการ์ด' })
  @MaxLength(150, { message: 'ชื่อยาวเกิน 150 ตัวอักษร' })
  displayName: string;
}
