import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ID } from 'src/global/interfaces/id.interface';
import { PaginateResponse } from 'src/global/interfaces/paginate.interface';
import { CreateNftDto } from './dtos/create-nft.dto';
import { QueryNftDto } from './dtos/query-nft.dto';
import { UpdateNftDto } from './dtos/update-nft.dto';
import { NFT } from './schema/nft.schema';

@Injectable()
export class NftService {
  constructor(
    @InjectModel(NFT) private readonly model: ReturnModelType<typeof NFT>,
  ) {}

  get = async (query: QueryNftDto): Promise<PaginateResponse<NFT>> => {
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
    if (query.fileType !== undefined && query.fileType.length > 0) {
      tmp = [
        ...tmp,
        {
          $match: {
            fileType: query.fileType,
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

  getById = async (id: ID): Promise<NFT> => {
    return this.model.findById(id);
  };

  create = async (nft: CreateNftDto): Promise<NFT> => {
    return await this.model.create(nft);
  };

  update = async (id: ID, nft: UpdateNftDto): Promise<NFT> => {
    return await this.model.findByIdAndUpdate(id, nft, { new: true });
  };

  delete = async (id: ID): Promise<NFT> => {
    const idLevel = await this.model.findById(id);
    // if (idLevel.level > 1) {
    //   console.log('err');
    // }
    return await this.model.findByIdAndDelete(id);
  };
}
