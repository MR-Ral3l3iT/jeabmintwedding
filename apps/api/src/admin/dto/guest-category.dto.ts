import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GuestCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;
}

export class CreateGuestCategoryDto {
  @ApiProperty({ example: 'เพื่อนเจ้าบ่าว', maxLength: 100 })
  @IsString({ message: 'กรุณากรอกชื่อประเภทแขก' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อประเภทแขก' })
  @MaxLength(100, { message: 'ชื่อยาวเกิน 100 ตัวอักษร' })
  name: string;
}

export class UpdateGuestCategoryDto {
  @ApiPropertyOptional({ example: 'เพื่อนเจ้าสาว', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'กรุณากรอกชื่อประเภทแขก' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อประเภทแขก' })
  @MaxLength(100, { message: 'ชื่อยาวเกิน 100 ตัวอักษร' })
  name?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
