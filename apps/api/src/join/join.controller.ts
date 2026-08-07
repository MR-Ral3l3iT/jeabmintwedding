import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JoinService } from './join.service';
import {
  JoinGuestResponseDto,
  SubmitJoinDto,
  SubmitJoinResponseDto,
} from './dto/join.dto';

@ApiTags('Join')
@Controller('join')
export class JoinController {
  constructor(private readonly joinService: JoinService) {}

  @Get(':token')
  @ApiOperation({ summary: 'ดึงข้อมูลแขกสำหรับ prefills หน้า join (Public)' })
  @ApiResponse({ status: 200, type: JoinGuestResponseDto })
  @ApiResponse({ status: 404, description: 'ไม่พบลิงก์' })
  async getByToken(@Param('token') token: string): Promise<JoinGuestResponseDto> {
    return this.joinService.getByToken(token);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'บันทึกชื่อเรียก + ฝั่ง (Public)' })
  @ApiResponse({ status: 200, type: SubmitJoinResponseDto })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง' })
  @ApiResponse({ status: 404, description: 'ไม่พบลิงก์' })
  async submit(@Body() dto: SubmitJoinDto): Promise<SubmitJoinResponseDto> {
    return this.joinService.submit(dto);
  }
}
