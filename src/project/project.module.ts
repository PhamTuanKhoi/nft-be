import { Module, forwardRef } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { Project } from './schema/project.schema';
import { ProblemCategoryModule } from 'src/problem-category/problem-category.module';
import { UserService } from 'src/user/user.service';
@Module({
  imports: [
    TypegooseModule.forFeature([Project]),
    forwardRef(() => ProblemCategoryModule),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
