import { Module } from '@nestjs/common';
import { SettingsModule } from '@/settings/settings.module';
import { BotStudioController } from './bot-studio.controller';
import { BotStudioService } from './bot-studio.service';
import { BotStudioGuard } from './bot-studio.guard';

@Module({
  imports: [SettingsModule],
  controllers: [BotStudioController],
  providers: [BotStudioService, BotStudioGuard],
  exports: [BotStudioService],
})
export class BotStudioModule {}
