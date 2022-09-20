import { Module } from '@nestjs/common';
import { ProjectHistoryService } from './project-history.service';
import { ProjectHistoryController } from './project-history.controller';

@Module({
  controllers: [ProjectHistoryController],
  providers: [ProjectHistoryService]
})
export class ProjectHistoryModule {}
