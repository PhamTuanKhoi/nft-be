import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ID } from 'src/global/interfaces/id.interface';
import { PaginateResponse } from 'src/global/interfaces/paginate.interface';
import { CreateNftDto } from './dtos/create-nft.dto';
import { QueryNftDto } from './dtos/query-nft.dto';
import { UpdateNftDto } from './dtos/update-nft-dto';
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
    if (query.endTime) {
      tmp = [
        ...tmp,
        {
          $match: {
            endTime: { $gt: new Date().getTime() },
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
    return this.model
      .findById(id)
      .populate('creator')
      .populate('owner')
      .populate('collectionNft');
  };

  create = async (nft: CreateNftDto): Promise<NFT> => {
    return await this.model.create(nft);
  };

  update = async (id: ID, nft: UpdateNftDto): Promise<NFT> => {
    return await this.model
      .findByIdAndUpdate(id, nft, { new: true })
      .populate('creator')
      .populate('owner')
      .populate('collectionNft');
  };

  delete = async (id: ID): Promise<NFT> => {
    const idNft = await this.model.findById(id);
    if (idNft.level > 1) {
      throw new HttpException(
        "Can't not delete NFT great than 1",
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.model.findByIdAndDelete(id);
  };
}
