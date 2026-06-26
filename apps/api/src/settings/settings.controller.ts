import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { WeddingSettingsResponseDto } from './dto/wedding-settings.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'ข้อมูลงานแต่ง (Public)' })
  @ApiResponse({ status: 200, type: WeddingSettingsResponseDto })
  async getSettings(): Promise<WeddingSettingsResponseDto> {
    return this.settingsService.getSettings();
  }
}
