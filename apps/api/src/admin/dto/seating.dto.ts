import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
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

  @ApiProperty()
  shortName: string;

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
  groupShortName?: string;

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

  @ApiProperty({ example: 'เจ้าภาพ', maxLength: 20 })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อย่อ' })
  @MaxLength(20, { message: 'ชื่อย่อยาวเกิน 20 ตัวอักษร' })
  shortName: string;

  @ApiPropertyOptional({ example: '#8B5E3C' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}

export class UpdateSeatingGroupDto {
  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customName?: string;

  @ApiPropertyOptional({ maxLength: 20 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  shortName?: string;

  @ApiPropertyOptional()
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

export class SetTablesGroupDto {
  @ApiProperty({ type: [String], example: ['A1', 'A2', 'B1'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(90)
  @IsString({ each: true })
  codes: string[];

  @ApiPropertyOptional({ description: 'id กลุ่ม — null/ว่างเพื่อเคลียร์' })
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
