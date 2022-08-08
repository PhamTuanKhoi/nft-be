import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { Badges } from './schema/badges.schema';
import { TypegooseModule } from 'nestjs-typegoose';

@Module({
  imports: [TypegooseModule.forFeature([Badges])],
  controllers: [BadgesController],
  providers: [BadgesService]
})
export class BadgesModule {}
