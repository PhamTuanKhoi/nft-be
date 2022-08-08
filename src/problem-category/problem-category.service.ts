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
  async create(createProblemCategoryDto: CreateProblemCategoryDto) {
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
    return `This action returns all problemCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} problemCategory`;
  }

  update(id: number, updateProblemCategoryDto: UpdateProblemCategoryDto) {
    return `This action updates a #${id} problemCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} problemCategory`;
  }
}
