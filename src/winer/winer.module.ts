import { Module } from '@nestjs/common';
import { WinerService } from './winer.service';
import { WinerController } from './winer.controller';

@Module({
  controllers: [WinerController],
  providers: [WinerService]
})
export class WinerModule {}
