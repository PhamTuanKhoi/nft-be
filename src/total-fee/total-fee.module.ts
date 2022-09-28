import { Module } from '@nestjs/common';
import { TotalFeeService } from './total-fee.service';
import { TotalFeeController } from './total-fee.controller';

@Module({
  controllers: [TotalFeeController],
  providers: [TotalFeeService]
})
export class TotalFeeModule {}
