import { Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dtos/createCollection.dto';
import { Collection } from './schemas/collection.schema';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { QueryCollectionDto } from './dtos/queryCollection.dto';
import { PaginateResponse } from 'src/global/interfaces/paginate.interface';
import { UpdateCollectionDto } from './dtos/updateCollection.dto';
import { ID } from '../global/interfaces/id.interface';
import { ConfigService } from '@nestjs/config';
import { ContractService } from 'src/nft/contracts/contract.service';
import { NftStandardEnum } from '../nft/interfaces/nftStandard.enum';
import { QueryNFTDto } from 'src/nft/dtos/queryNFT.dto';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection)
    private readonly model: ReturnModelType<typeof Collection>,
    private readonly configService: ConfigService,
    private readonly contractService: ContractService,
  ) {}

  async findAll(
    query: QueryCollectionDto,
  ): Promise<PaginateResponse<Collection>> {
    const findQuery = this.model.find();

    if (query.search) {
      findQuery.or([
        { name: { $regex: '.*' + query.search + '.*', $options: 'i' } },
      ]);
    }

    if ('status' in query) {
      findQuery.where({ [query.status]: true });
    }

    if ('activated' in query) {
      findQuery.where({ activated: query.activated });
    }

    const count = await this.model.find().merge(findQuery).countDocuments();

    findQuery
      .sort({ [query.sortBy]: query.sortType })
      .skip((query.page - 1) * query.size)
      .limit(query.size);

    const result = await findQuery.populate('creator').exec();

    return {
      items: result,
      paginate: {
        page: query.page,
        size: query.size,
        count,
      },
    };
  }

  async findOne(id: ID) {
    return await this.model.findById(id).exec();
  }

  async findOrCreateByAddress(
    address: string,
    chainId: number,
    standard: NftStandardEnum,
  ) {
    let collection = await this.findByAddress(address, chainId);
    if (!collection) {
      collection = await this.createByAddress(address, chainId, standard);
    }
    return collection;
  }

  async findByAddress(address: string, chainId: number) {
    return this.model.findOne({
      address: address.toLowerCase(),
      chainId,
    });
  }

  async create(collection: CreateCollectionDto, userId: string) {
    return this.model.create({
      ...collection,
      address: collection.address.toLowerCase(),
      creator: userId,
    });
  }

  async createByAddress(
    address: string,
    chainId: number,
    standard: NftStandardEnum,
  ) {
    const contract = this.contractService.getCollectionContract(
      chainId,
      address,
      standard,
    );
    let [name, symbol, owner] = ['', '', ''];

    try {
      name = await contract.name();
      symbol = await contract.symbol();
      owner = await contract.owner();
    } catch (e) {
      console.log('Error', e);
    }

    return this.model.create({
      owner,
      name,
      symbol,
      address: address.toLowerCase(),
      chainId: chainId,
      standard,
    });
  }

  async remove(id: ID): Promise<Collection> {
    return this.model.findByIdAndRemove(id);
  }

  async update(id: ID, payload: UpdateCollectionDto) {
    return this.model.findByIdAndUpdate(id, payload, { new: true });
  }

  async findByCreator(creatorId: any, chainId: any) {
    return this.model.find({
      $or: [{ creator: creatorId }, { public: true }],
      chainId,
    });
  }
  async findCollectionSales() {
    const findQuery = await this.model.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
        },
      },
      { 
        $unwind: '$creator'
      }, 
       {
        $lookup: {
          from: "sales",
          localField: "creator._id",
          foreignField: "seller",
          as: "sales",
        }
      }, 
      {
        $lookup: {
          from: "nfts",
          localField: "address",
          foreignField: "tokenAddress",
          as: "nfts",
        }
      },
      // nfts.length
      {
        $addFields: {
          "lengthNfts": {$size: "$nfts"}
       }
      },
      {
        $match: { 
          "lengthNfts": {
            $gt: 3
          }
        }
      }
    ])
    return findQuery;
  }
}
