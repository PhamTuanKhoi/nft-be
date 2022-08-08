import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { CreateProblemCategoryDto } from './dto/create-problem-category.dto';
import { UpdateProblemCategoryDto } from './dto/update-problem-category.dto';
import { ProblemCategory } from './schema/problem-category.schema';

@Injectable()
export class ProblemCategoryService {
  private readonly logger = new Logger(ProblemCategoryService.name);
  constructor(
    @InjectModel(ProblemCategory)
    private readonly model: ReturnModelType<typeof ProblemCategory>,
  ){}
  async create(createProblemCategoryDto: CreateProblemCategoryDto): Promise<ProblemCategory> {
    try {
      const createdProblemCategory =  await this.model.create(createProblemCategoryDto)
      this.logger.log(`created a new ProblemCategory by id#${createdProblemCategory?._id}`)
      return createdProblemCategory;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }

  async isModelExist(id, isOptional = false, msg = '') {
    if (isOptional && !id) return;
    const errorMessage = msg || `id-> ${ProblemCategory.name} not found`;
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(errorMessage);
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

  async update(id: string, updateProblemCategoryDto: UpdateProblemCategoryDto): Promise<ProblemCategory> {
    try {
      const updated = await this.model.findByIdAndUpdate(id, updateProblemCategoryDto, {new: true})
      this.logger.log(`updated problemCategory by id#${updated._id}`)
      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }

  async remove(id: string): Promise<ProblemCategory> {
    try {
      const removed = await this.model.findByIdAndDelete(id)
      this.logger.log(`removed problemCategory by id#${removed._id}`)
      return removed;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }
}
