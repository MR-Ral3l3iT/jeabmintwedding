import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JoinService } from './join.service';
import {
  JoinGuestResponseDto,
  LinkLineDto,
  LinkLineResponseDto,
  SubmitJoinDto,
  SubmitJoinResponseDto,
} from './dto/join.dto';

@ApiTags('Join')
@Controller('join')
export class JoinController {
  constructor(private readonly joinService: JoinService) {}

  @Post('link-line')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ผูก Guest กับ LINE ผ่าน LIFF ID token (Public)' })
  @ApiResponse({ status: 200, type: LinkLineResponseDto })
  @ApiResponse({ status: 400, description: 'ผูกไม่สำเร็จ' })
  @ApiResponse({ status: 401, description: 'ID token ไม่ถูกต้อง' })
  async linkLine(@Body() dto: LinkLineDto): Promise<LinkLineResponseDto> {
    return this.joinService.linkLine(dto);
  }

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
