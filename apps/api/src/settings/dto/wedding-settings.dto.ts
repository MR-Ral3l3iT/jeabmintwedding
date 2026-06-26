import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class TimelineItemDto {
  @ApiProperty({ example: '14:00' })
  @IsString()
  @MaxLength(20)
  time: string;

  @ApiProperty({ example: 'พิธีแห่ขันหมาก' })
  @IsString()
  @MaxLength(200)
  event: string;
}

export class WeddingSettingsResponseDto {
  @ApiProperty()
  groomName: string;

  @ApiProperty()
  groomNickname: string;

  @ApiProperty()
  brideName: string;

  @ApiProperty()
  brideNickname: string;

  @ApiProperty()
  weddingDate: string;

  @ApiProperty()
  venue: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  lineOaId: string;

  @ApiProperty()
  lineOaUrl: string;

  @ApiProperty()
  rsvpContactPhone: string;

  @ApiProperty()
  mapsUrl: string;

  @ApiProperty()
  rsvpDeadline: string;

  @ApiPropertyOptional()
  promptpay?: string;

  @ApiPropertyOptional()
  promptpayName?: string;

  @ApiPropertyOptional()
  bankName?: string;

  @ApiPropertyOptional()
  bankAccountNumber?: string;

  @ApiPropertyOptional()
  bankAccountName?: string;

  @ApiPropertyOptional()
  paymentQrUrl?: string;

  @ApiProperty({ type: [TimelineItemDto] })
  timeline: TimelineItemDto[];

  @ApiProperty()
  updatedAt: string;
}

export class UpdateWeddingSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  groomName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  groomNickname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  brideName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  brideNickname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  weddingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  venue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lineOaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  lineOaUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  rsvpContactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  mapsUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  rsvpDeadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  promptpay?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  promptpayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankAccountNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  bankAccountName?: string;

  @ApiPropertyOptional({ type: [TimelineItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimelineItemDto)
  timeline?: TimelineItemDto[];
}
