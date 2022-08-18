import { BadRequestException, Injectable } from '@nestjs/common';
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

  getById = async (id: ID): Promise<Collection> => {
    return await this.model.findById(id).populate('nfts').populate('creator');
  };

  async ranking() {
    try {
      const result = await this.model.aggregate([
        {
          $lookup: {
            from: 'nfts',
            localField: 'nfts',
            foreignField: '_id',
            pipeline: [
              { $sort: { price: -1 } },
              {
                $lookup: {
                  from: 'users',
                  localField: 'owner',
                  foreignField: '_id',
                  pipeline: [{ $sort: { price: -1 } }],
                  as: 'owners',
                },
              },
              {
                $unwind: '$owners',
              },
            ],
            as: 'nfts',
          },
        },
        {
          $project: {
            name: '$name',
            image: '$image',
            nfts: '$nfts',
          },
        },
        {
          $unwind: '$nfts',
        },
        {
          $group: {
            _id: {
              id: '$_id',
              nameCollection: '$name',
              imageCollection: '$image',
              // owners: '$nfts.owners',
            },
            total: {
              $sum: '$nfts.total',
            },
            maxPower: {
              $max: '$nfts.owners.power',
            },
          },
        },
        {
          $project: {
            _id: 0,
            collectionId: '$_id.id',
            nameCollection: '$_id.nameCollection',
            imageCollection: '$_id.imageCollection',
            total: '$total',
            maxPower: '$maxPower',
          },
        },
      ]);
      const data = await this.model.aggregate([
        {
          $lookup: {
            from: 'nfts',
            localField: 'nfts',
            foreignField: '_id',
            pipeline: [
              { $sort: { price: -1 } },
              {
                $lookup: {
                  from: 'users',
                  localField: 'owner',
                  foreignField: '_id',
                  pipeline: [{ $sort: { power: -1 } }],
                  as: 'owners',
                },
              },
              {
                $unwind: '$owners',
              },
            ],
            as: 'nfts',
          },
        },
        {
          $project: {
            nfts: '$nfts',
          },
        },
        {
          $unwind: '$nfts',
        },
        {
          $project: {
            ownerId: '$nfts.owners._id',
            avatar: '$nfts.owners.avatar',
            power: '$nfts.owners.power',
          },
        },
        {
          $group: {
            _id: {
              conllectionId: '$_id',
              ownerId: '$ownerId',
              avatar: '$avatar',
              power: '$power',
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id.conllectionId',
            ownerId: '$_id.ownerId',
            avatar: '$_id.avatar',
            power: '$_id.power',
          },
        },
        {
          $sort: {
            power: -1,
          },
        },
      ]);
      return {
        compare: result,
        owners: data,
      };
    } catch (error) {
      // this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  getAll = async (): Promise<any> => {
    return await this.model.find().populate('nfts').populate('creator');
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

  async remove(id: ID): Promise<Collection> {
    return this.model.findByIdAndRemove(id);
  }
}
