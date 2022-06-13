import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { Sale } from './schemas/sale.schema';
import { ID } from 'src/global/interfaces/id.interface';
import { OwnershipService } from './ownership.service';
import { SaleNFTDto } from './dtos/saleNFT.dto';
import { ethers } from 'ethers';
import { abi as MarketAbi } from './contracts/ERC1155Marketplace.json';
import { ConfigService } from '@nestjs/config';
import { NftService } from './nft.service';
import { UserService } from '../user/user.service';
import { EventService } from '../event/event.service';
import { PaginateResponse } from '../global/interfaces/paginate.interface';
import { Interval } from '@nestjs/schedule';
import { SaleType } from './interfaces/saleType.enum';
import { CollectionService } from 'src/collection/collection.service';
import { CreateLazyNFTDto } from './dtos/createLazyNFT.dto';
import { NFT } from './schemas/nft.schema';
import { isEmpty } from '../utils';

@Injectable()
export class SaleService {
  private contractMatic: ethers.Contract;
  private readonly logger = new Logger('Sale service');

  constructor(
    @InjectModel(Sale)
    private readonly model: ReturnModelType<typeof Sale>,
    private readonly ownershipService: OwnershipService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly eventService: EventService,
    @Inject(forwardRef(() => NftService))
    private nftService: NftService,
    private readonly collectionService: CollectionService,
  ) {}

  findOne = async (id: ID) =>
    await this.model.findById(id).populate('nft').populate('seller').exec();

  update = async (id: ID, saleNFT) => {
    return await this.model.findByIdAndUpdate(id, saleNFT, { new: true });
  };

  increaseView = async (body) => {
    const id = body.id;
    const sale = await this.model.findById(id).exec();
    if (!sale) {
      throw new Error('Not found sale by id = ' + id);
    }

    const views = sale?.views + 1;

    return await this.model.findByIdAndUpdate(id, { views }, { new: true });
  };

  async findAll(page, limit, query): Promise<PaginateResponse<Sale>> {
    const findQuery = this.model.find({ quantity: { $gt: 0 } });
    if (query.search) {
      findQuery.populate({
        path: 'nft',
        match: {
          name: { $regex: '.*' + query.search + '.*', $options: 'i' },
        },
      });
    }

    if (query.saleType) {
      const currentDate = new Date().getTime() / 1000;
      findQuery.find({
        saleType: parseInt(query.saleType),
        endTime: { $gt: currentDate },
      });
    }

    findQuery.sort({ updatedAt: -1 });

    if (!query.search) {
      findQuery.populate('nft');
    }

    let result = await findQuery.populate('seller').exec();
    result = result.filter((item) => item.nft !== null);
    const count = result.length;
    result = result.slice((page - 1) * limit, page * limit);
    return {
      items: result,
      paginate: {
        page: page,
        size: limit,
        count,
      },
    };
  }

  async searchSale(page, limit, query) {
    console.log('searchSale', query);
    const name = query?.name || '';
    const fileType = query?.fileType || '';
    const saleType = query?.saleType;

    const mathSaleType =
      saleType === 'ALL' || isEmpty(saleType)
        ? { saleType: { $gte: 0 } }
        : { saleType: +saleType };

    const findQuery = this.model.aggregate([
      {
        $match: { quantity: { $gt: 0 } },
      },
      {
        $lookup: {
          from: 'nfts',
          localField: 'nft',
          foreignField: '_id',
          as: 'nft',
        },
      },
      {
        $unwind: '$nft',
      },
     
      {
        $project: {
          id: '$nft._id',
          name: '$nft.name',
          supply: '$nft.supply',
          image: '$nft.image',
          tokenId: '$nft.tokenId',
          collectionId: '$nft.collectionId',
          quantity: '$quantity',
          endTime: '$endTime',
          unitPrice: '$unitPrice',
          saleType: '$saleType',
          seller: '$seller',
          type: '$nft.fileType',
          typeOrigin: '$nft.originType',
          auctionId: '$auctionId',
          nft: {
            _id: '$nft._id',
            name: '$nft.name',
            supply: '$nft.supply',
            image: '$nft.image',
            tokenId: '$nft.tokenId',
            collectionId: '$nft.collectionId',
            creator: '$nft.creator',
            fileType: '$nft.fileType',
            originType: '$nft.originType',
            media: '$nft.media',
          },
        },
      },
       {
        $lookup: {
          from: 'users',
          localField: 'nft.creator',
          foreignField: '_id',
          as: 'creator',
        },
      },
      {
        $unwind: '$creator',
      },
       {
        $lookup: {
          from: 'users',
          localField: 'seller',
          foreignField: '_id',
          as: 'seller',
        },
      },
      {
        $unwind: '$seller',
      },
      {
        $match: {
          $and: [
            { name: { $regex: '.*' + name + '.*', $options: 'i' } },
            { type: { $regex: '.*' + fileType + '.*', $options: 'i' } },
            mathSaleType,
          ],
        },
      },
    ]);
    // find({ quantity: { $gt: 0 } }).populate('nft');
    // if (query.search) {
    //   findQuery.or([
    //     { description: { $regex: '.*' + query.search + '.*', $options: 'i' } },
    //     { title: { $regex: '.*' + query.search + '.*', $options: 'i' } },
    //   ]);
    // }
    // if (query.saleType) {
    //   const currentDate = new Date().getTime() / 1000;
    //   findQuery.find({
    //     saleType: SaleType.AUCTION,
    //     endTime: { $gt: currentDate },
    //   });
    // }

    // const count = await this.model.find().merge(findQuery).countDocuments();
    // findQuery
    //   .skip((page - 1) * limit)
    //   .limit(limit)
    //   .sort({ updatedAt: -1 });
    const result = await findQuery.exec();
    return {
      items: result,
      paginate: {
        page: page,
        size: limit,
        count: result.length,
      },
    };
  }

  async findBySellerAndNft(sellerId: any, nftId: any) {
    return this.model.findOne({ seller: sellerId, nft: nftId });
  }

  async findByAuctionId(auctionId: number) {
    return this.model.findOne({ auctionId });
  }

  async putOnSale(payload: SaleNFTDto, sellerId: ID) {
    const ownership = await this.ownershipService.findByOwnerAndNft(
      sellerId,
      payload.nftId,
    );
    if (!ownership || ownership.amount < payload.quantity) {
      throw new HttpException(
        'Seller not have enough ownership of this NFT',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sale = await this.findBySellerAndNft(sellerId, payload.nftId);
    if (sale) {
      sale.quantity = payload.quantity;
      sale.unitPrice = payload.unitPrice;
      return sale.save();
    }

    return this.model.create({
      seller: sellerId,
      ownership,
      nft: payload.nftId,
      quantity: payload.quantity,
      unitPrice: payload.unitPrice,
      minBid: payload.minBid,
      endTime: payload.endTime,
      saleType: payload.saleType,
      chainId: payload.chainId,
    });
  }

  async takeDown(tokenAddress, tokenId, seller, chainId) {
    const nft = await this.nftService.findByToken(
      tokenAddress,
      tokenId,
      chainId,
    );

    if (!nft) {
      this.logger.error(`NFT ${tokenAddress} ${tokenId} not found in database`);
      return;
    }

    const userSeller = await this.userService.findOrCreateByAddress(seller);
    const sale = await this.findBySellerAndNft(userSeller.id, nft.id);
    sale.quantity = 0;
    return sale.save();
  }

  async buy(saleId: ID, buyerId: ID, quantity: number) {
    const sale = await this.model.findById(saleId);
    if (!sale) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }

    console.log(quantity, 'quantity');
    if (sale.quantity < quantity) {
      throw new HttpException(
        'Sale not have enough quantity',
        HttpStatus.BAD_REQUEST,
      );
    }

    sale.quantity -= quantity;
    await sale.save();
    return sale;
  }

  getInSaleByUser(userId: any) {
    return this.model
      .find({ seller: userId, quantity: { $gt: 0 } })
      .populate('nft');
  }

  getInSaleNft(nftId: any) {
    return this.model
      .find({ nft: nftId, quantity: { $gt: 0 } })
      .populate('seller');
  }

  async onAuctionEnded(eventArgs: ethers.utils.Result, chainId: number) {
    const [_address, _id, _seller, _maxBidder, _maxBid, _amount, _success] =
      eventArgs;

    if (_success) {
      return this.onBought(
        [_address, _id, _seller, _amount, _maxBid, _maxBidder],
        chainId,
      );
    } else {
      return this.takeDown(_address, _id, _seller, chainId);
    }
  }

  async onItemUpdated(eventArgs: ethers.utils.Result, chainId: number) {
    const [_address, _id, _seller, _amount, _price, _type, _endTime] =
      eventArgs;
    this.logger.verbose(
      `Item updated: ${_address} ${_id} ${_seller} ${_amount} ${_price} ${_type} ${_endTime}`,
    );

    const nft = await this.nftService.findByToken(_address, _id, chainId);
    if (!nft) {
      this.logger.error(
        `NFT ${_address} ${_id}, chain ${chainId} not found in database`,
      );
      return;
    }
    const saleDto: SaleNFTDto = {
      nftId: nft.id.toString(),
      quantity: +_amount,
      unitPrice: +_price / 1e18,
      minBid: +_price / 1e18,
      endTime: +_endTime,
      saleType: +_type,
      chainId: chainId,
    };

    const user = await this.userService.findOrCreateByAddress(_seller);
    return this.putOnSale(saleDto, user.id);
  }

  async onBought(eventArgs: ethers.utils.Result, chainId: number) {
    const [_address, _id, _seller, _amount, _price, _buyer] = eventArgs;
    this.logger.verbose(
      `Item bought: ${_address} ${_id} ${_seller} ${_amount} ${_price} ${_buyer}`,
    );

    const nft = await this.nftService.findByToken(_address, _id, chainId);
    if (!nft) {
      this.logger.error(
        `NFT ${_address} ${_id}, ${chainId} not found in database`,
      );
      return;
    }

    const userSeller = await this.userService.findOrCreateByAddress(_seller);
    const userBuyer = await this.userService.findOrCreateByAddress(_buyer);

    const sale = await this.findBySellerAndNft(userSeller.id, nft.id);
    await this.buy(sale.id, userBuyer.id, +_amount);
  }

  async getTopSeller() {
    const findQuery = this.model.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'seller',
          pipeline: [
            {
              $match: {
                verified: true,
              },
            },
          ],
          foreignField: '_id',
          as: 'seller',
        },
      },
      {
        $unwind: '$seller',
      },
      {
        $group: {
          _id: {
            seller: '$seller',
          },
          total: { $count: {} },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 15 },
    ]);

    const result = await findQuery.exec();
    console.log('rs', result);
    return result;
  }

  async getFeature() {
    return this.model.find({ feature: true }).populate('nft');
  }

  async findByCollection(id: ID) {
    const coll = await this.collectionService.findOne(id);
    const findQuery = this.model.aggregate([
      {
        $match: {
          quantity: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: 'nfts',
          localField: 'nft',
          foreignField: '_id',
          as: 'nft',
        },
      },
      {
        $unwind: '$nft',
      },
      {
        $match: {
          'nft.collectionId': coll._id,
        },
      },
    ]);

    return await findQuery.exec();
  }

  async putOnSaleLazy(payload: CreateLazyNFTDto) {
    const nft = await this.nftService.createLazyNFT(
      payload.tokenAddress,
      payload.chainId,
      payload.signature,
      payload,
      payload.standard,
    );
    const ownership = await this.ownershipService.findByOwnerAndNft(
      nft.creator,
      nft._id,
    );

    const sale = await this.findBySellerAndNft(nft.creator, nft._id);
    if (sale) {
      sale.quantity = payload.supply;
      sale.unitPrice = payload.price;
      return sale.save();
    }

    return this.model.create({
      seller: nft.creator,
      ownership,
      nft: nft._id,
      quantity: payload.supply,
      unitPrice: payload.price,
      minBid: payload.price,
      endTime: payload.endTime,
      saleType: payload.saleType,
      chainId: payload.chainId,
      auctionId: payload.auctionId,
    });
  }

  async takeDownLazy(id) {
    const sale = await this.model.findById(id).populate('nft');
    if (!sale) {
      throw new HttpException(`Sale ${id} not found`, HttpStatus.NOT_FOUND);
    }
    const nft: NFT = sale.nft as NFT;
    if (!nft || !nft.isLazy) {
      throw new HttpException(`NFT ${nft.id} not found`, HttpStatus.NOT_FOUND);
    }
    const ownership = await this.ownershipService.findByOwnerAndNft(
      nft.creator,
      nft.id,
    );
    // delete sale
    await this.model.deleteOne({ _id: id });
    await this.nftService.deleteNft(nft.id);
    await this.ownershipService.deleteOwnership(ownership.id);
    return sale;
  }

  async onLazyAucitonEnded(eventArgs: ethers.utils.Result, chainId: number) {
    const [
      _address,
      _auctionId,
      _seller,
      _maxBidder,
      _maxBid,
      _amount,
      _success,
      _tokenId,
    ] = eventArgs;
    const sale = await this.findByAuctionId(_auctionId);
    const bidder = await this.userService.findOrCreateByAddress(_maxBidder);

    if (_success) {
      await this.buy(sale.id, bidder.id, +_amount);
    } else {
      await this.takeDownLazy(sale.id);
    }
  }
}
