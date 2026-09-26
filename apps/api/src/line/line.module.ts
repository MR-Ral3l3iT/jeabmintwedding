import { Module } from '@nestjs/common';
import { LineController } from './line.controller';
import { LineService } from './line.service';
import { BotConversationService } from './bot-conversation.service';
import { SettingsModule } from '@/settings/settings.module';
import { BotStudioModule } from '@/bot-studio/bot-studio.module';
import { AdminModule } from '@/admin/admin.module';

@Module({
  imports: [SettingsModule, BotStudioModule, AdminModule],
  controllers: [LineController],
  providers: [LineService, BotConversationService],
  exports: [LineService],
})
export class LineModule {}
