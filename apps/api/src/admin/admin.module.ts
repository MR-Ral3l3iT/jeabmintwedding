import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SeatingService } from './seating.service';
import { SettingsModule } from '@/settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [AdminService, SeatingService],
  controllers: [AdminController],
  exports: [SeatingService],
})
export class AdminModule {}
