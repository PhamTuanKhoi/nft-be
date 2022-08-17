import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ID } from 'src/global/interfaces/id.interface';
import { PaginateResponse } from 'src/global/interfaces/paginate.interface';
import { CreateHistoryDto } from './dtos/create-history.dto';
import { QueryHistoryDto } from './dtos/query-history.dto';
import { UpdateHistoryDto } from './dtos/update-history.dto';
import { History } from './schema/history.schema';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History)
    private readonly model: ReturnModelType<typeof History>,
  ) {}

  get = async (query: QueryHistoryDto): Promise<PaginateResponse<History>> => {
    let tmp: any = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'nfts',
          localField: 'nft',
          foreignField: '_id',
          as: 'nfts',
        },
      },
    ];
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
    if (query.sortBy !== undefined && query.sortBy.length > 0) {
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
            currentLevel: -1,
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
    return this.model.find().populate('user').populate('nft');
  };

  getById = async (id: ID): Promise<History> => {
    return this.model.findById(id).populate('user').populate('nft');
  };

  create = async (nft: CreateHistoryDto): Promise<History> => {
    return await this.model.create(nft);
  };

  update = async (id: ID, nft: UpdateHistoryDto): Promise<History> => {
    return await this.model
      .findByIdAndUpdate(id, nft, { new: true })
      .populate('user')
      .populate('nft');
  };

  delete = async (id: ID): Promise<History> => {
    return await this.model.findByIdAndDelete(id);
  };
}
