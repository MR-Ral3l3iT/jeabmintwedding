import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { RsvpResponseDto } from './dto/rsvp-response.dto';

@ApiTags('RSVP')
@Controller('rsvp')
export class RsvpController {
  constructor(private readonly rsvpService: RsvpService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'บันทึกการตอบรับ + คำอวยพร (Public)' })
  @ApiResponse({ status: 201, type: RsvpResponseDto })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง' })
  async create(@Body() dto: CreateRsvpDto): Promise<RsvpResponseDto> {
    return this.rsvpService.create(dto);
  }
}
