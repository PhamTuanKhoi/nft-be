import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ID } from 'src/global/interfaces/id.interface';
import { PaginateResponse } from 'src/global/interfaces/paginate.interface';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { QueryCategoryDto } from './dtos/query-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category } from './schema/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category)
    private readonly model: ReturnModelType<typeof Category>,
  ) {}

  get = async (
    query: QueryCategoryDto,
  ): Promise<PaginateResponse<Category>> => {
    let tmp = [];
    if (query.search !== undefined && query.search.length > 0) {
      tmp = [
        ...tmp,
        {
          $match: {
            title: { $regex: '.*' + query.search + '.*', $options: 'i' },
          },
        },
      ];
    }
    if (
      query.sortBy !== undefined &&
      query.sortBy.length > 0 &&
      query.sortType
    ) {
      tmp = [
        ...tmp,
        {
          $sort: {
            [query.sortBy]: query.sortType,
          },
        },
      ];
    } else {
      tmp = [
        ...tmp,
        {
          $sort: {
            createdAt: -1,
          },
        },
      ];
    }
    let findQuery = this.model.aggregate(tmp);
    const count = (await findQuery.exec()).length;
    if (
      query.limit !== undefined &&
      query.page !== undefined &&
      query.limit > 0 &&
      query.page > 0
    ) {
      findQuery = findQuery
        .limit(query.limit)
        .skip((query.page - 1) * query.limit);
    }
    const result = await findQuery.exec();
    return {
      items: result,
      paginate: {
        count: count || 0,
        limit: query.limit || 0,
        page: query.page || 0,
      },
    };
  };

  getAll = async (): Promise<any> => {
    return this.model.find();
  };

  getById = async (id: ID): Promise<Category> => {
    return this.model.findById(id);
  };

  create = async (nft: CreateCategoryDto): Promise<Category> => {
    return await this.model.create(nft);
  };

  update = async (id: ID, nft: UpdateCategoryDto): Promise<Category> => {
    return await this.model
      .findByIdAndUpdate(id, nft, { new: true })
      .populate('user')
      .populate('nft');
  };

  delete = async (id: ID): Promise<Category> => {
    return await this.model.findByIdAndDelete(id);
  };
}
