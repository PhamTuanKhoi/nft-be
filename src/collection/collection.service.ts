import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ID } from 'src/global/interfaces/id.interface';
import { PaginateResponse } from 'src/global/interfaces/paginate.interface';
import { UserRoleEnum } from 'src/user/interfaces/userRole.enum';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { QueryCollectionDto } from './dtos/query-collection.dto';
import { UpdateCollectionDto } from './dtos/update-collection.dto';
import { Collection } from './schema/collection.schema';

@Injectable()
export class CollectionService {
  private readonly logger = new Logger(CollectionService.name);
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
            owners: [],
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
          $match: {
            'nfts.owners.role': {
              $ne: UserRoleEnum.ADMIN,
            },
          },
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
            idColl: '$_id.conllectionId',
            ownerId: '$_id.ownerId',
            avatar: '$_id.avatar',
            power: '$_id.power',
          },
        },
        {
          $sort: {
            collectionId: -1,
            power: -1,
          },
        },
      ]);
      result.map((item) => {
        data.map((val) => {
          if (item.collectionId.toString() === val.idColl.toString()) {
            item.owners.push(val);
          }
        });
      });
      return result;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async mockNft() {
    try {
      return this.model.aggregate([
        {
          $lookup: {
            from: 'nfts',
            localField: '_id',
            foreignField: 'collectionNft',
            pipeline: [
              {
                $match: {
                  imported: true,
                },
              },
            ],
            as: 'nfts',
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $group: {
            _id: {
              id: '$_id',
              name: '$name',
              image: '$image',
              likes: '$likes',
              nfts: '$nfts',
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id.id',
            name: '$_id.name',
            image: '$_id.image',
            likes: '$_id.likes',
            nfts: '$_id.nfts',
          },
        },
      ]);
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async totalPrice() {
    try {
      //price
      const totalPrice = await this.model.aggregate([
        {
          $lookup: {
            from: 'nfts',
            localField: '_id',
            foreignField: 'collectionNft',
            pipeline: [
              {
                $match: {
                  imported: true,
                },
              },
              {
                $lookup: {
                  from: 'minings',
                  let: {
                    levelNft: '$level',
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [{ $eq: ['$level', '$$levelNft'] }],
                        },
                      },
                    },
                  ],
                  as: 'mining',
                },
              },
              {
                $unwind: '$mining',
              },
            ],
            as: 'nfts',
          },
        },
        {
          $unwind: '$nfts',
        },
        {
          $group: {
            _id: {
              id: '$_id',
            },
            totalPrice: {
              $sum: '$nfts.mining.price',
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id.id',
            totalPrice: '$totalPrice',
          },
        },
      ]);
      //data
      const result = await this.model.aggregate([
        {
          $group: {
            _id: {
              id: '$_id',
              title: '$name',
              description: '$description',
              image: '$image',
            },
          },
        },
        {
          $project: {
            _id: 0,
            collId: '$_id.id',
            title: '$_id.name',
            description: '$_id.description',
            image: '$_id.image',
            totalPrice: '',
          },
        },
      ]);

      result.map((item) => {
        totalPrice.map((val) => {
          if (item.collId.toString() === val.id.toString()) {
            item.totalPrice = val.totalPrice;
          }
        });
      });
      return result;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async mockNftById(id: string) {
    try {
      let pipeline: any = [
        {
          $match: {
            $expr: {
              $eq: ['$_id', { $toObjectId: id }],
            },
          },
        },
        {
          $lookup: {
            from: 'nfts',
            localField: '_id',
            foreignField: 'collectionNft',
            pipeline: [
              {
                $match: {
                  imported: true,
                },
              },
              {
                $lookup: {
                  from: 'minings',
                  let: {
                    levelNft: '$level',
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [{ $eq: ['$level', '$$levelNft'] }],
                        },
                      },
                    },
                  ],
                  as: 'mining',
                },
              },
              { $unwind: '$mining' },
            ],
            as: 'nfts',
          },
        },
        {
          $group: {
            _id: {
              id: '$_id',
              nameSubcollection: '$name',
              imageSubcollection: '$image',
              nfts: '$nfts',
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id.id',
            nameSubcollection: '$_id.nameSubcollection',
            imageSubcollection: '$_id.imageSubcollection',
            nfts: '$_id.nfts',
          },
        },
      ];

      return this.model.aggregate(pipeline);
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async getByIdCategory(category: ID) {
    try {
      return await this.model.aggregate([
        {
          $match: {
            $expr: {
              $eq: ['$category', { $toObjectId: category }],
            },
          },
        },
      ]);
    } catch (error) {
      this.logger.error(error?.message, error.stack);
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
