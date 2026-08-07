import { Module } from '@nestjs/common';
import { LineController } from './line.controller';
import { LineService } from './line.service';
import { SettingsModule } from '@/settings/settings.module';
import { BotStudioModule } from '@/bot-studio/bot-studio.module';

@Module({
  imports: [SettingsModule, BotStudioModule],
  controllers: [LineController],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}
