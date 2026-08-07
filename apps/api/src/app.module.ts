import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RsvpModule } from './rsvp/rsvp.module';
import { AdminModule } from './admin/admin.module';
import { InviteModule } from './invite/invite.module';
import { SettingsModule } from './settings/settings.module';
import { LineModule } from './line/line.module';
import { JoinModule } from './join/join.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RsvpModule,
    AdminModule,
    InviteModule,
    SettingsModule,
    LineModule,
    JoinModule,
  ],
})
export class AppModule {}
