import { Injectable } from '@nestjs/common';
import { CreateProblemCategoryDto } from './dto/create-problem-category.dto';
import { UpdateProblemCategoryDto } from './dto/update-problem-category.dto';

@Injectable()
export class ProblemCategoryService {
  create(createProblemCategoryDto: CreateProblemCategoryDto) {
    return 'This action adds a new problemCategory';
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
