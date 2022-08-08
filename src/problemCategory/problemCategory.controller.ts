import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ID } from 'src/global/interfaces/id.interface';
import { PaginateResponse } from 'src/global/interfaces/paginate.interface';
import { CreateProblemCategoryDto } from './dtos/create-problemCategory.dto';
import { QueryCollectionDto } from './dtos/query-collection.dto';
import { UpdateProblemCategoryDto } from './dtos/update-collection.dto';
import { ProblemCategoryService } from './ProblemCategory.service';
import { ProblemCategory } from './schema/problemCategory.schema';
@ApiTags('COLLECTION')
@Controller('collections')
export class ProblemCategoryController {
  constructor(private readonly service: ProblemCategoryService) {}

  // GET v1/collections/
  @Get()
  async get(
    @Query() query: QueryCollectionDto,
  ): Promise<PaginateResponse<ProblemCategory>> {
    return this.service.get(query);
  }

  // GET v1/collections/
  @Get('all/collections')
  async getAll() {
    return this.service.getAll();
  }
  //GET v1/collections/:id
  @Get(':id')
  async getById(@Param('id') id: ID): Promise<ProblemCategory> {
    return this.service.getById(id);
  }
  // POST v1/collections
  @Post()
  async create(@Body() collection: CreateProblemCategoryDto): Promise<ProblemCategory> {
    return this.service.create(collection);
  }

  // PATCH /v1/collections/:id
  @Patch(':id')
  async update(@Param('id') id: ID, @Body() collection: UpdateProblemCategoryDto) {
    return this.service.update(id, collection);
  }

  // DELETE /v1/collections/:id
  @Delete(':id')
  async remove(@Param('id') id: ID) {
    return await this.service.remove(id);
  }
}
