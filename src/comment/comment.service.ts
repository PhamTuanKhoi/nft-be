import { QueryComment } from './dtos/queryComment.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { ID } from '../global/interfaces/id.interface';
import { Comment } from './schema/comment.schema';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment)
        private readonly model: ReturnModelType<typeof Comment>,
    ) { }

    getByNft = async (nftId, query: QueryComment) => {

        const size = query.size ? query.size * 1 : 10;
        const page = query.page ? query.page * 1 : 1
        const sortBy = query.sortBy ? query.sortBy : "createAt"
        let sortType = -1
        if (query.sortType && (query.sortType === "asc" || parseInt(query.sortType) == 1)) {
            sortType = 1
        }
        const findQuery = this.model.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },  {
                $unwind: "$user"
            },
            {
                $lookup: {
                    from: 'nfts',
                    localField: 'nft',
                    pipeline: [
                        {
                            $addFields: {
                                id: { $toString: "$_id" }
                            }
                        },
                        {
                            $match: {
                                id: nftId
                            }
                        }
                    ],
                    foreignField: '_id',
                    as: 'nft'
                }
            },
            {
                $unwind: "$nft"
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ]);
        const all = (await findQuery.exec());
        const count = all.length;
        const result = await findQuery.skip((page - 1) * size).limit(size).exec();
        return {
            items: result,
            paginate: {
                page,
                size,
                count,
                all
            }
        }
    }

    create = async (comment) => await this.model.create(comment);
}