import { BadRequestException, forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ProblemCategoryService } from 'src/problem-category/problem-category.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './schema/project.schema';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);
  constructor(
    @InjectModel(Project)
    private readonly model: ReturnModelType<typeof Project>,
    @Inject(forwardRef(() => ProblemCategoryService))
    private readonly problemCategoryService: ProblemCategoryService,
  ){}
  async create(createProjectDto: CreateProjectDto) {
    try {
      await this.problemCategoryService.isModelExist(createProjectDto.problemCategory)
      const createdProject =  await this.model.create(createProjectDto)
      this.logger.log(`created a new project by id#${createdProject?._id}`)
      return createdProject;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }

  findAll() {
    try {
      return this.model.find();
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }

  findOne(id: string) {
    try {
      return this.model.findById(id);
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    try {
      await this.problemCategoryService.isModelExist(updateProjectDto.problemCategory)
      const updated = await this.model.findByIdAndUpdate(id, updateProjectDto, {new: true})
      this.logger.log(`updated project by id#${updated._id}`)
      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }

  async remove(id: string) {
    try {
      const removed = await this.model.findByIdAndDelete(id)
      this.logger.log(`removed project by id#${removed._id}`)
      return removed;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }
}
