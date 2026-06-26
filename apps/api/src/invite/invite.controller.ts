import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InviteService } from './invite.service';
import { InviteResponseDto } from './dto/invite-response.dto';

@ApiTags('Invite')
@Controller('invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Get(':token')
  @ApiOperation({ summary: 'ดึงข้อมูลเชิญจากลิงก์ (Public)' })
  @ApiResponse({ status: 200, type: InviteResponseDto })
  @ApiResponse({ status: 404, description: 'ไม่พบลิงก์เชิญ' })
  async getByToken(@Param('token') token: string): Promise<InviteResponseDto> {
    return this.inviteService.getByToken(token);
  }
}
