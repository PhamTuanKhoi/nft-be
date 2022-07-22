import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ID } from 'src/global/interfaces/id.interface';
import { PaginateResponse } from 'src/global/interfaces/paginate.interface';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { QueryCollectionDto } from './dtos/query-collection.dto';
import { UpdateCollectionDto } from './dtos/update-collection.dto';
import { Collection } from './schema/collection.schema';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection)
    private readonly model: ReturnModelType<typeof Collection>,
  ) {}

  get = async (
    query: QueryCollectionDto,
  ): Promise<PaginateResponse<Collection>> => {
    let tmp = [];
    if (query.search !== undefined && query.search.length > 0) {
      tmp = [
        ...tmp,
        {
          $match: {
            name: { $regex: '.*' + query.search + '.*', $options: 'i' },
          },
        },
      ];
    }
    tmp = [
      ...tmp,
      {
        $sort: {
          [query.sortBy]: query.sortType,
        },
      },
    ];
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

  getById = async (id: ID): Promise<Collection> => {
    return await this.model.findById(id);
  };

  create = async (collection: CreateCollectionDto): Promise<Collection> => {
    return await this.model.create(collection);
  };

  update = async (
    id: ID,
    collection: UpdateCollectionDto,
  ): Promise<Collection> => {
    return await this.model.findByIdAndUpdate(id, collection, { new: true });
  };
}
