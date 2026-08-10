import { Module } from '@nestjs/common';
import { LineModule } from '@/line/line.module';
import { JoinController } from './join.controller';
import { JoinService } from './join.service';

@Module({
  imports: [LineModule],
  controllers: [JoinController],
  providers: [JoinService],
})
export class JoinModule {}
