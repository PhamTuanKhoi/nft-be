import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { ProblemCategoryController } from './problemCategory.controller';
import { ProblemCategory } from './schema/problemCategory.schema';
import { ProblemCategoryService } from './ProblemCategory.service';

@Module({
  imports: [TypegooseModule.forFeature([ProblemCategory])],
  controllers: [ProblemCategoryController],
  providers: [ProblemCategoryService],
  exports: [ProblemCategoryService],
})
export class ProblemCategoryModule {}
