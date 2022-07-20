import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { InjectModel } from "nestjs-typegoose";
import { ID } from "src/global/interfaces/id.interface";
import { PaginateResponse } from "src/global/interfaces/paginate.interface";
import { QueryNftDto } from "./dtos/query-nft.dto";
import { NFT } from "./schema/nft.schema";

@Injectable()
export class NftService {
    constructor(
        @InjectModel(NFT) private readonly model: ReturnModelType<typeof NFT>
    ) { }

    get = async (query: QueryNftDto): Promise<PaginateResponse<NFT>> => {
        let tmp = [];
        if (query.search !== undefined && query.search.length > 0) {
            tmp = [
                ...tmp,
                {
                    $match: {
                        name: { $regex: ".*" + query.search + ".*", $options: "i" }
                    }
                }
            ]
        }
        let findQuery = this.model.aggregate(tmp);
        tmp = [
            ...tmp,
            {
                [query.sortBy]: query.sortType
            }
        ]
        const count = (await findQuery.exec()).length;
        if (query.limit !== undefined && query.page !== undefined && query.limit > 0 && query.page > 0) {
            findQuery = findQuery.limit(query.limit).skip((query.page - 1) * query.limit);
        }
        const result = await findQuery.exec();
        return {
            items: result,
            paginate: {
                count,
                limit: 0,
                page: 0
            }
        }
    }

    create = async (nft: NFT): Promise<NFT> => {
        return this.model.create(nft);
    }

    update = async (id: ID, nft: NFT): Promise<NFT> => {
        return await this.model.findByIdAndUpdate(id, nft, { new: true });
    }

    delete = async (id: ID): Promise<NFT> => {
        return await this.model.findByIdAndDelete(id);
    }
}