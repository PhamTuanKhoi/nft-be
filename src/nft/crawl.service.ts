import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { NftService } from './nft.service';
import { EventService } from '../event/event.service';
import { ContractService } from './contracts/contract.service';
import { SaleService } from './sale.service';
import { BidService } from './bid.service';
import { NftStandardEnum } from './interfaces/nftStandard.enum';

@Injectable()
export class CrawlService {
  private readonly logger = new Logger('CrawlService');
  private readonly nft721Service: ContractService;
  private readonly nft1155Service: ContractService;

  constructor(
    private readonly eventService: EventService,
    private nftService: NftService,
    private saleService: SaleService,
    private bidService: BidService,
    contract721Service: ContractService,
    contract1155Service: ContractService,
  ) {
    this.nft721Service = contract721Service.init(NftStandardEnum.ERC721);
    this.nft1155Service = contract1155Service.init(NftStandardEnum.ERC1155);
  }

  async crawlTransaction(
    chainId: number,
    txHash: string,
    collectionAddress,
    standard: NftStandardEnum,
  ) {
    switch (standard) {
      case NftStandardEnum.ERC721:
        return this.crawlTransaction721(chainId, txHash, collectionAddress);
        break;
      case NftStandardEnum.ERC1155:
        return await this.crawlTransaction1155(
          chainId,
          txHash,
          collectionAddress,
        );
    }
  }

  async crawlTransaction1155(
    chainId: number,
    txHash: string,
    collectionAddress,
  ): Promise<number> {
    const logs = await this.nft1155Service.getAllEvents(
      chainId,
      collectionAddress,
      txHash,
    );
    let eventsConfirmed = 0;
    for await (const log of logs) {
      const event = await this.eventService.findOrCreate(log, txHash, chainId);
      if (!event.confirmed) {
        await this.handleEvent1155(log, chainId, collectionAddress, txHash);
        await this.eventService.confirm(txHash, log.name, chainId, log.index);
        eventsConfirmed++;
      }
    }
    return eventsConfirmed;
  }

  async crawlTransaction721(
    chainId: number,
    txHash: string,
    collectionAddress,
  ): Promise<number> {
    const logs = await this.nft721Service.getAllEvents(
      chainId,
      collectionAddress,
      txHash,
    );
    let eventsConfirmed = 0;
    for await (const log of logs) {
      const event = await this.eventService.findOrCreate(log, txHash, chainId);
      if (!event.confirmed) {
        await this.handleEvent1155(log, chainId, collectionAddress, txHash);
        await this.eventService.confirm(txHash, log.name, chainId, log.index);
        eventsConfirmed++;
      }
    }
    return eventsConfirmed;
  }

  async handleEvent1155(
    eventLog: ethers.utils.LogDescription,
    chainId: number,
    contractAddress: string,
    txHash: string,
  ) {
    switch (eventLog.name) {
      case 'TransferSingle':
        const collectionContract = this.nft1155Service.getCollectionContract(
          chainId,
          contractAddress,
          NftStandardEnum.ERC1155,
        );

        const transactionInfo = await this.nft1155Service.getTransactionInfo(
          chainId,
          txHash,
          NftStandardEnum.ERC1155,
        );
        if (
          transactionInfo.name &&
          ['buyLazy', 'endAuctionLazy'].includes(transactionInfo.name)
        ) {
          await this.nftService.onTransferSingle(
            eventLog.args,
            chainId,
            collectionContract,
            NftStandardEnum.ERC1155,
            true,
            transactionInfo.args._signature,
          );
        } else {
          await this.nftService.onTransferSingle(
            eventLog.args,
            chainId,
            collectionContract,
            NftStandardEnum.ERC1155,
          );
        }

        break;
      case 'ItemUpdated':
        await this.saleService.onItemUpdated(eventLog.args, chainId);
        break;
      case 'Bought':
        await this.saleService.onBought(eventLog.args, chainId);
        break;
      case 'BidAdded':
        await this.bidService.onBidAdded(eventLog.args, chainId);
        break;
      case 'AuctionEnded':
        await this.saleService.onAuctionEnded(eventLog.args, chainId);
        break;
      case 'LazyBidAdded':
        await this.bidService.onLazyBidAdded(eventLog.args, chainId);
        break;
      case 'LazyAuctionEnded':
        await this.saleService.onLazyAucitonEnded(eventLog.args, chainId);
        break;
    }
  }

  async handleEvent721(
    eventLog: ethers.utils.LogDescription,
    chainId: number,
    contractAddress: string,
    txHash: string,
  ) {
    const args = eventLog.args;
    switch (eventLog.name) {
      case 'Transfer':
        const collectionContract = this.nft721Service.getCollectionContract(
          chainId,
          contractAddress,
          NftStandardEnum.ERC721,
        );

        const transactionInfo = await this.nft1155Service.getTransactionInfo(
          chainId,
          txHash,
          NftStandardEnum.ERC721,
        );

        const transferArgs = ['', args.from, args.to, args.id, 1];
        if (
          transactionInfo.name &&
          ['buyLazy', 'endAuctionLazy'].includes(transactionInfo.name)
        ) {
          await this.nftService.onTransferSingle(
            transferArgs,
            chainId,
            collectionContract,
            NftStandardEnum.ERC721,
            true,
            transactionInfo.args._signature,
          );
        } else {
          await this.nftService.onTransferSingle(
            transferArgs,
            chainId,
            collectionContract,
            NftStandardEnum.ERC721,
          );
        }

        break;
      case 'ItemUpdated':
        const updateArgs = [
          args._address,
          args._id,
          args._seller,
          1,
          args._price,
          args._type,
          args._endTime,
        ];
        await this.saleService.onItemUpdated(updateArgs, chainId);
        break;
      case 'ItemBought':
        const boughtArgs = [
          args._address,
          args._id,
          args._seller,
          1,
          args._price,
          args._buyer,
        ];
        await this.saleService.onBought(boughtArgs, chainId);
        break;
      case 'BidAdded':
        const bidArgs = [
          args._address,
          args._id,
          args._seller,
          args._bidder,
          args._value,
        ];
        await this.bidService.onBidAdded(bidArgs, chainId);
        break;
      case 'AuctionEnded':
        const auctionArgs = [
          args._address,
          args._id,
          args._seller,
          args._maxBidder,
          args._maxBid,
          1,
          args._success,
        ];
        await this.saleService.onAuctionEnded(auctionArgs, chainId);
        break;
      case 'LazyBidAdded':
        // TODO: implement
        await this.bidService.onLazyBidAdded(eventLog.args, chainId);
        break;
      case 'LazyAuctionEnded':
        // TODO: implement
        await this.saleService.onLazyAucitonEnded(eventLog.args, chainId);
        break;
    }
  }
}
