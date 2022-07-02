import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { PaginateResponse } from '../global/interfaces/paginate.interface';
import { ID } from '../global/interfaces/id.interface';
import { QueryWalletDto } from './dtos/queryEvent.dto';
import { Event } from './schemas/event.schema';
import { BigNumber, ethers } from "ethers";
import { log } from 'util';
import { EventLogInterface } from '../nft/interfaces/EventLog.interface';
import { pipeline } from 'stream';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event)
        private readonly model: ReturnModelType<typeof Event>,
    ) {
    }

    async findAll(query: QueryWalletDto): Promise<PaginateResponse<Event>> {
        const findQuery = this.model.find();
        if (query.search) {
            findQuery.or([
                { description: { $regex: '.*' + query.search + '.*', $options: 'i' } },
                { title: { $regex: '.*' + query.search + '.*', $options: 'i' } },
            ]);
        }

        const count = await this.model.find().merge(findQuery).countDocuments();
        findQuery
            .sort({ [query.sortBy]: query.sortType })
            .skip(query.page * query.size)
            .limit(query.size);

        return {
            items: await findQuery.exec(),
            paginate: {
                page: query.page,
                size: query.size,
                count,
            },
        };
    }

    async findOne(id: ID): Promise<Event> {
        return await this.model.findById(id).populate('nft').exec();
    }

    async findByTransactionHash(
        transactionHash: string,
        eventName: string,
        chainId: number,
        index: number,
    ): Promise<Event> {
        return await this.model
            .findOne({ transactionHash, name: eventName, index, chainId })
            .exec();
    }

    decodeArgs(arg: ethers.utils.Result) {
        const argObject = { ...arg };
        // change property type BigNumber to string
        Object.keys(argObject).forEach((key) => {
            if (argObject[key] instanceof BigNumber) {
                argObject[key] = argObject[key].toString();
            }
        });
        return argObject;
    }

    async create(
        event: EventLogInterface,
        chainId,
        txHash: string,
    ): Promise<Event> {
        return this.model.create({
            address: event.address,
            ...event,
            args: this.decodeArgs(event.args),
            transactionHash: txHash,
            confirmed: false,
            chainId,
        });
    }

    async findOrCreate(log: EventLogInterface, txHash: string, chainId: number) {
        const event = await this.findByTransactionHash(
            txHash,
            log.name,
            chainId,
            log.index,
        );
        if (event) {
            return event;
        }
        return this.create(log, chainId, txHash);
    }

    async confirm(
        transactionHash: string,
        name: string,
        chainId: number,
        index: number,
    ): Promise<Event> {
        return this.model.findOneAndUpdate(
            { transactionHash, name, chainId, index },
            { confirmed: true },
            { new: true },
        );
    }

    async remove(id: ID): Promise<Event> {
        return this.model.findByIdAndRemove(id);
    }

    async activity(page: number, limit: number, query: any) {
        const typeFilter = query.typeFilter;
        let matchTypeFilter: any;
        switch (typeFilter) {
            case "Bids":
                matchTypeFilter = {
                    $match: {
                        name: "BidAdded"
                    }
                }
                break;
            case "Listings":
                matchTypeFilter = {
                    $match: {
                        name: "ItemUpdated"
                    }
                }
                break;
            case "Purchases":
                matchTypeFilter = {
                    $match: {
                        name: "Bought"
                    }
                }
                break;
            case "Sales":
                matchTypeFilter = {
                    $match: {
                        name: "ItemUpdated",
                        "args._type": 0
                    }
                }
                break;
            case "":
                break;
        }

        let tmp: any = [
            {
                $match: {
                    name: { $ne: 'TransferSingle' }
                }
            },
            {
                $lookup: {
                    from: 'nfts',
                    let: { address: { $toLower: "$args._address" }, chainId: "$chainId", tokenId: { $toInt: "$args._id" } },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$tokenAddress", "$$address"] },
                                            { $eq: ["$chainId", "$$chainId"] },
                                            { $eq: ["$tokenId", "$$tokenId"] }
                                        ]
                                }
                            }
                        },
                    ],
                    as: 'nft'
                }
            },
            {
                $unwind: "$nft"
            },
            {
                $lookup: {
                    from: "users",
                    let: { seller: { $toLower: "$args._seller" } },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: [{ $toLower: "$address" }, "$$seller"] },
                                        ]
                                }
                            }
                        },
                    ],
                    as: "seller"
                }
            },
            {
                $lookup: {
                    from: "sales",
                    localField: 'nft._id',
                    foreignField: 'nft',
                    as: "sale"
                }
            },
            {
                $unwind: "$sale"
            },
            {
                $lookup: {
                    from: 'collections',
                    localField: 'nft.collectionId',
                    foreignField: '_id',
                    as: 'collection'
                }
            },
            {
                $unwind: "$collection"
            },
            {
                $sort: { createdAt: -1 }
            }
        ]

        if (matchTypeFilter) {
            tmp = [
                matchTypeFilter,
                ...tmp
            ]
        }
        const findQuery = this.model.aggregate(tmp);
        const count = (await findQuery.exec()).length;
        const all = await findQuery.exec();
        const result = all.slice(0, page * limit);
        return {
            items: result,
            paginate: {
                page: page,
                size: limit,
                count,
                all
            },
        };
    }

    async rankingByUser(query) {

        const page = query.page ? query.page * 1 : 1
        const limit = query.limit ? query.limit * 1 : 10
        const time = query.time ? query.time * 1 : 7
        const date = new Date();

        if (time === 0) {
            date.setDate(date.getDate() - 100000)
        } else {
            date.setDate(date.getDate() - time)
        }

        const findQuery = this.model.aggregate([
            {
                $match: { name: { $eq: 'Bought' }, createdAt: { $gte: date } }
            },
            {
                $lookup: {
                    from: 'nfts',
                    let: { address: { $toLower: "$args._address" }, chainId: "$chainId", tokenId: { $toInt: "$args._id" } },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$tokenAddress", "$$address"] },
                                            { $eq: ["$chainId", "$$chainId"] },
                                            { $eq: ["$tokenId", "$$tokenId"] }
                                        ]
                                }
                            }
                        },
                    ],
                    as: 'nft'
                }
            },
            {
                $unwind: "$nft"
            },
            {
                $lookup: {
                    from: 'users',
                    let: { buyer: { $toUpper: "$args._buyer" } },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$address", "$$buyer"] },
                                        ]
                                }
                            }
                        },
                    ],
                    as: 'user'
                }
            },
            {
                $unwind: "$user"
            },
            {
                $group: {
                    _id: { user: '$user' },
                    sold: { $sum: { $toInt: "$args._amount" } },
                    total: { $sum: { $toDouble: "$args._price" } }
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        const all = await findQuery.exec();
        const count = all.length
        const result = await findQuery.skip((page - 1) * limit).limit(limit).exec();

        return {
            items: result,
            paginate: {
                page: page,
                size: limit,
                count,
                all
            },
        };

    }

    async rankings(page, limit, time) {
        console.log('time', time)
        const date = new Date();
        if (time.time === 0) {
            date.setDate(date.getDate() - 100000)
        } else {
            date.setDate(date.getDate() - time.time)
        }
        const query = this.model.aggregate([
            {
                $match: { name: { $eq: 'Bought' }, createdAt: { $gte: date } }
            },
            {
                $lookup: {
                    from: 'nfts',
                    let: { address: { $toLower: "$args._address" }, chainId: "$chainId", tokenId: { $toInt: "$args._id" } },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$tokenAddress", "$$address"] },
                                            { $eq: ["$chainId", "$$chainId"] },
                                            { $eq: ["$tokenId", "$$tokenId"] }
                                        ]
                                }
                            }
                        },
                    ],
                    as: 'nft'
                }
            },
            {
                $unwind: "$nft"
            },
            {
                $lookup: {
                    from: 'collections',
                    localField: 'nft.collectionId',
                    foreignField: '_id',
                    as: 'collection'
                }
            },
            {
                $unwind: "$collection"
            },
            {
                $group: {
                    _id: { collection: '$collection' },
                    sold: { $sum: { $toInt: "$args._amount" } },
                    total: { $sum: { $toDouble: "$args._price" } }
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        return {
            items: await query,
            paginate: {
                page: page,
                size: limit
            },
        };

    }
}
