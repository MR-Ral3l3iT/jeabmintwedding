import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export enum GuestCategoryDto {
  GROOM_FRIEND = 'GROOM_FRIEND',
  BRIDE_FRIEND = 'BRIDE_FRIEND',
  GROOM_ELDER = 'GROOM_ELDER',
  BRIDE_ELDER = 'BRIDE_ELDER',
  OTHER = 'OTHER',
}

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
    enum: GuestCategoryDto,
    description: 'ประเภทแขก',
    example: GuestCategoryDto.GROOM_FRIEND,
  })
  @IsEnum(GuestCategoryDto, { message: 'กรุณาเลือกประเภทแขก' })
  category: GuestCategoryDto;
}
