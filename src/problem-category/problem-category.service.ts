import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { CreateProblemCategoryDto } from './dto/create-problem-category.dto';
import { UpdateProblemCategoryDto } from './dto/update-problem-category.dto';
import { ProblemCategory } from './schema/problem-category.schema';

@Injectable()
export class ProblemCategoryService {

  constructor(
    @InjectModel(ProblemCategory)
    private readonly model: ReturnModelType<typeof ProblemCategory>,
  ){}
  async create(createProblemCategoryDto: CreateProblemCategoryDto) {
    try {
      const createdProblemCategory =  await this.model.create(createProblemCategoryDto)
      return createdProblemCategory;
    } catch (error) {
      console.log(error)    
    }
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
