import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetGuestsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'ค้นหาจากชื่อ' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'filter: true=เข้าร่วม, false=ไม่สะดวก' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  attending?: boolean;

  @ApiPropertyOptional({
    enum: ['pending', 'attending', 'declined', 'responded'],
    description: 'filter ตามสถานะตอบรับ (responded = ตอบรับแล้วทั้งเข้าร่วมและไม่สะดวก)',
  })
  @IsOptional()
  @IsIn(['pending', 'attending', 'declined', 'responded'])
  status?: 'pending' | 'attending' | 'declined' | 'responded';

  @ApiPropertyOptional({
    enum: ['GROOM_FRIEND', 'BRIDE_FRIEND', 'GROOM_ELDER', 'BRIDE_ELDER', 'OTHER'],
    description: 'filter ตามประเภทแขก',
  })
  @IsOptional()
  @IsIn(['GROOM_FRIEND', 'BRIDE_FRIEND', 'GROOM_ELDER', 'BRIDE_ELDER', 'OTHER'])
  category?: 'GROOM_FRIEND' | 'BRIDE_FRIEND' | 'GROOM_ELDER' | 'BRIDE_ELDER' | 'OTHER';

  @ApiPropertyOptional({ enum: ['created', 'rsvp'], default: 'created' })
  @IsOptional()
  @IsIn(['created', 'rsvp'])
  sort?: 'created' | 'rsvp';
}
