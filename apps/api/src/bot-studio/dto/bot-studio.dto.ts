import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BotStudioLoginDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string;
}

export class UpdateBotPersonaDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  displayName!: string;

  @ApiProperty({ description: 'คำที่บอทใช้แทนตัวเองเวลาตอบ' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  selfCallName!: string;

  @ApiProperty()
  @IsString()
  tone!: string;

  @ApiProperty()
  @IsString()
  languageNote!: string;

  @ApiProperty({ description: 'กติกาการใส่อีโมจิในคำตอบ' })
  @IsString()
  emojiPolicy!: string;

  @ApiProperty()
  @IsInt()
  @Min(100)
  @Max(900)
  maxLength!: number;

  @ApiProperty()
  @IsString()
  doNotDo!: string;

  @ApiProperty()
  @IsString()
  whenUnknown!: string;
}

export class CreateBotTopicDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  body!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateBotTopicDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

class ReorderItemDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsInt()
  sortOrder!: number;
}

export class ReorderBotTopicsDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items!: ReorderItemDto[];
}
