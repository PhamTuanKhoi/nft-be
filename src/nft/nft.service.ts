import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { prop, ReturnModelType } from '@typegoose/typegoose';
import { Console } from 'console';
import { InjectModel } from 'nestjs-typegoose';
import { ID } from 'src/global/interfaces/id.interface';
import { PaginateResponse } from 'src/global/interfaces/paginate.interface';
import { MiningService } from 'src/mining/mining.service';
import { CreateNftDto } from './dtos/create-nft.dto';
import { QueryNftDto } from './dtos/query-nft.dto';
import { UpdateNftDto } from './dtos/update-nft-dto';
import { NFT } from './schema/nft.schema';

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);
  constructor(
    @InjectModel(NFT) private readonly model: ReturnModelType<typeof NFT>,
    @Inject(forwardRef(() => MiningService))
    private readonly miningService: MiningService,
  ) {}

  get = async (query: QueryNftDto): Promise<PaginateResponse<NFT>> => {
    let tmp: any = [
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
        },
      },
    ];
    if (query.level) {
      tmp = [
        ...tmp,
        {
          $match: {
            level: query.level,
          },
        },
      ];
    }
    if (query.collectionid) {
      tmp = [
        ...tmp,
        {
          $match: {
            $expr: {
              $eq: ['$collectionNft', { $toObjectId: query.collectionid }],
            },
          },
        },
      ];
    }
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

    if (query.status && query.status !== undefined) {
      let status = JSON.parse(query.status);
      let or: any = [];
      if (status.mine === true) {
        // endTime <= Date.now() && level < 12
        or = [
          ...or,
          {
            endTime: { $lte: Date.now() },
            level: { $lt: 12 },
          },
        ];
      }
      if (status.mining === true) {
        // endTime >= Date.now() && level < 12
        or = [
          ...or,
          {
            endTime: { $gte: Date.now() },
            level: { $lt: 12 },
          },
        ];
      }
      if (status.mined === true) {
        // endTime >= Date.now() && level < 12
        or = [
          ...or,
          {
            level: 12,
          },
        ];
      }
      if (or.length > 0) {
        tmp = [
          ...tmp,
          {
            $match: {
              $or: or,
            },
          },
        ];
      }
    }

    if (query.collection && query.collection !== undefined) {
      let collection = JSON.parse(query.collection);
      let or = collection.map((item) => {
        return {
          $eq: ['$collectionNft', { $toObjectId: item }],
        };
      });

      // console.log(or);
      if (or.length > 0) {
        tmp = [
          ...tmp,
          {
            $match: {
              $expr: { $or: or },
            },
          },
        ];
      }
    }
    if (query.levels && query.levels !== undefined) {
      // string to []
      let levels = JSON.parse(query.levels);
      let or = levels.map((item) => {
        return {
          level: item,
        };
      });
      if (or?.length > 0) {
        tmp = [
          ...tmp,
          {
            $match: {
              $or: or,
            },
          },
        ];
      }
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
            createdAt: 1,
          },
        },
      ];
    }

    // if (query.status) {
    //   if(query.status === 1){
    //     tmp = [
    //       {
    //         $match: {
    //           endTime: {
    //             $gte:
    //           }
    //         },
    //       },
    //       ...tmp,
    //     ];
    //   }
    // }

    let findQuery = this.model.aggregate(tmp);
    const count = (await findQuery.exec()).length;
    if (
      query.limit !== undefined &&
      query.page !== undefined &&
      query.limit > 0 &&
      query.page > 0
    ) {
      findQuery = findQuery
        .limit(query.limit * query.page || 1)
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
    return this.model
      .find()
      .populate('creator')
      .populate('owner')
      .populate('collectionNft');
  };

  async findOne(id: string) {
    try {
      return this.model.findById(id).lean();
    } catch (error) {
      console.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }
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

  async viewer(id: ID) {
    try {
      let view = 0;
      const isNft = await this.getById(id);
      if (!isNft) {
        throw new HttpException('Nft not fount !', HttpStatus.BAD_REQUEST);
      }
      if (isNft) {
        view = isNft.viewer + 1;
      }
      const updatedViewer = await this.model.findByIdAndUpdate(id, {
        viewer: view,
      });
      return updatedViewer;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  update = async (id: ID, nft: UpdateNftDto): Promise<NFT> => {
    try {
      const updatedNft = await this.model
        .findByIdAndUpdate(id, nft, { new: true })
        .populate('creator')
        .populate('owner')
        .populate('collectionNft');
      this.logger.log(`updated a nft by id#${updatedNft?._id}`);
      return updatedNft;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  };

  updateTotalPrice = async (id: ID, nft: UpdateNftDto): Promise<NFT> => {
    try {
      let priced = 0;
      const isNft = await this.getById(id);
      if (!isNft) {
        throw new HttpException('Nft not fount !', HttpStatus.BAD_REQUEST);
      }
      const Mining = await this.miningService.getByLevel(nft.level - 1);
      if (!Mining) {
        throw new HttpException('Mining not fount !', HttpStatus.BAD_REQUEST);
      }
      if (Mining) {
        priced = Mining.price * Mining.multiplier;
        nft.price = Mining.price * Mining.multiplier;
      }
      if (isNft) {
        nft.total = isNft.price + priced;
      }
      const updatedNft = await this.model
        .findByIdAndUpdate(id, nft, { new: true })
        .populate('creator')
        .populate('owner')
        .populate('collectionNft');
      this.logger.log(`updated total price a nft by id#${updatedNft?._id}`);
      return updatedNft;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
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
