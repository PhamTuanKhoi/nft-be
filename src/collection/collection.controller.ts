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
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { QueryCollectionDto } from './dtos/query-collection.dto';
import { UpdateCollectionDto } from './dtos/update-collection.dto';
import { Collection } from './schema/collection.schema';
@ApiTags('COLLECTION')
@Controller('collections')
export class CollectionController {
  constructor(private readonly service: CollectionService) {}

  // GET v1/collections/
  @Get()
  async get(
    @Query() query: QueryCollectionDto,
  ): Promise<PaginateResponse<Collection>> {
    return this.service.get(query);
  }

  // GET v1/collections/
  @Get('all/collections')
  async getAll() {
    return this.service.getAll();
  }
  //GET v1/collections/:id
  @Get(':id')
  async getById(@Param('id') id: ID): Promise<Collection> {
    return this.service.getById(id);
  }
  // POST v1/collections
  @Post()
  async create(@Body() collection: CreateCollectionDto): Promise<Collection> {
    return this.service.create(collection);
  }

  // PATCH /v1/collections/:id
  @Patch(':id')
  async update(@Param('id') id: ID, @Body() collection: UpdateCollectionDto) {
    return this.service.update(id, collection);
  }

  // DELETE /v1/collections/:id
  @Delete(':id')
  async remove(@Param('id') id: ID) {
    return await this.service.remove(id);
  }
}
