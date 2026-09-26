import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class SeatingGuestBriefDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  categoryName?: string;
}

export class SeatingGroupResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  guestCategoryId?: string;

  @ApiPropertyOptional()
  customName?: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty({ type: [String], description: 'รหัสโต๊ะที่ติดกลุ่มนี้' })
  tableCodes: string[];
}

export class SeatingSpotResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ enum: ['TABLE', 'FACILITY'] })
  kind: 'TABLE' | 'FACILITY';

  @ApiPropertyOptional()
  label?: string;

  @ApiProperty()
  xPercent: number;

  @ApiProperty()
  yPercent: number;

  @ApiProperty()
  widthPercent: number;

  @ApiProperty()
  heightPercent: number;

  @ApiPropertyOptional()
  groupId?: string;

  @ApiPropertyOptional()
  groupName?: string;

  @ApiPropertyOptional()
  groupColor?: string;

  @ApiProperty({ type: [SeatingGuestBriefDto] })
  guests: SeatingGuestBriefDto[];
}

export class SeatingPlanResponseDto {
  @ApiProperty({ type: [SeatingSpotResponseDto] })
  spots: SeatingSpotResponseDto[];

  @ApiProperty({ type: [SeatingGroupResponseDto] })
  groups: SeatingGroupResponseDto[];

  @ApiProperty({ type: [SeatingGuestBriefDto], description: 'แขกที่ยังไม่มีโต๊ะ' })
  unassignedGuests: SeatingGuestBriefDto[];
}

export class CreateSeatingGroupDto {
  @ApiProperty({ example: 'โต๊ะเจ้าภาพ', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อกลุ่ม' })
  @MaxLength(100)
  customName: string;

  @ApiPropertyOptional({ example: '#8B5E3C' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}

export class SetTableGroupDto {
  @ApiPropertyOptional({ description: 'id ของ seating group — ส่ง null/ว่างเพื่อเคลียร์' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== '')
  @IsString()
  groupId?: string | null;
}

export class SetTableGuestsDto {
  @ApiProperty({ type: [String], description: 'รายการ guest id บนโต๊ะนี้ (แทนที่ชุดเดิม)' })
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  guestIds: string[];
}
