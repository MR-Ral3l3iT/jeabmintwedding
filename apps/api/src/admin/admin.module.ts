import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SettingsModule } from '@/settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
