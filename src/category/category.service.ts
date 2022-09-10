import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(CategoryService.name);
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

  async mockNft() {
    try {
      return this.model.aggregate([
        {
          $lookup: {
            from: 'collections',
            localField: '_id',
            foreignField: 'category',
            pipeline: [
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
              // { $unwind: '$nfts' },
            ],
            as: 'collections',
          },
        },
        {
          $unwind: '$collections',
        },
        {
          $group: {
            _id: {
              id: '$_id',
              name: '$title',
              image: '$image',
              nfts: '$collections.nfts',
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id.id',
            name: '$_id.name',
            image: '$_id.image',
            nfts: '$_id.nfts',
          },
        },
      ]);
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async mockNftById(query: QueryCategoryDto) {
    try {
      let pipeline: any = [
        {
          $match: {
            $expr: {
              $eq: ['$_id', { $toObjectId: query.id }],
            },
          },
        },
        {
          $lookup: {
            from: 'collections',
            localField: '_id',
            foreignField: 'category',
            pipeline: [
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
              // { $unwind: '$nfts' },
            ],
            as: 'collections',
          },
        },
        {
          $unwind: '$collections',
        },
        {
          $group: {
            _id: {
              id: '$_id',
              name: '$title',
              image: '$image',
              nameSubcollection: '$collections.name',
              imageSubcollection: '$collections.image',
              nfts: '$collections.nfts',
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id.id',
            name: '$_id.name',
            image: '$_id.image',
            nameSubcollection: '$_id.nameSubcollection',
            imageSubcollection: '$_id.imageSubcollection',
            nfts: '$_id.nfts',
          },
        },
      ];

      if (query.collectionId) {
        pipeline.splice(3, 0, {
          $match: {
            $expr: {
              $eq: ['$collections._id', { $toObjectId: query.collectionId }],
            },
          },
        });
      }
      return this.model.aggregate(pipeline);
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }
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
    try {
      const updated = await this.model.findByIdAndUpdate(id, nft, {
        new: true,
      });
      this.logger.log(`created a new category by id#${updated?._id}`);
      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  };

  delete = async (id: ID): Promise<Category> => {
    return await this.model.findByIdAndDelete(id);
  };
}
