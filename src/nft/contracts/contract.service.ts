import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { abi as ERC1155CollectionABI } from './ERC1155Collection.json';
import { abi as ERC1155MarketABI } from './ERC1155Marketplace.json';
import { abi as ERC721CollectionABI } from './ERC721Collection.json';
import { abi as ERC721MarketABI } from './ERC721Marketplace.json';
import { NftStandardEnum } from '../interfaces/nftStandard.enum';

@Injectable()
export class ContractService {
  public chainIds: number[] = [];
  public prcUrls: string[] = [];
  public marketAddresses: string[] = [];
  public nftStandard: NftStandardEnum;

  constructor(private readonly configService: ConfigService) {}

  public init(nftStandard: NftStandardEnum): ContractService {
    this.nftStandard = nftStandard;
    const chainIds = this.configService.get<string>('CHAIN_IDS');
    this.chainIds = chainIds.split(',').map((id) => parseInt(id, 10));
    this.chainIds.forEach((id, index) => {
      this.prcUrls.push(this.configService.get<string>(`PRC_URL_${index}`));
      this.marketAddresses.push(
        this.configService.get<string>(`MARKET_ADDRESS_${index}`),
      );
    });
    return this;
  }

  public getCollectionContract(
    chainId: number,
    address: string,
    standard: NftStandardEnum,
  ): ethers.Contract {
    const rpcProvider = this.chainToProvider(chainId);
    switch (standard) {
      case NftStandardEnum.ERC721:
        return new ethers.Contract(address, ERC721CollectionABI, rpcProvider);
      case NftStandardEnum.ERC1155:
        return new ethers.Contract(address, ERC1155CollectionABI, rpcProvider);
    }
  }

  public getMarketContract(chainId: number) {
    const rpcProvider = this.chainToProvider(chainId);
    const marketAddress = this.chainIdToMarketAddress(chainId);
    return new ethers.Contract(marketAddress, ERC1155MarketABI, rpcProvider);
  }

  public chainIdToPRC(chainId: number) {
    return this.prcUrls[this.chainIds.indexOf(chainId)];
  }

  public chainIdToMarketAddress(chainId: number) {
    return this.marketAddresses[this.chainIds.indexOf(chainId)];
  }

  public chainToProvider(chainId: number) {
    const prc = this.chainIdToPRC(chainId);
    console.log(`Connecting to ${prc}`);
    return new ethers.providers.JsonRpcProvider(prc);
  }

  public async getTransactionReceipt(chainId: number, txHash: string) {
    const rpcProvider = this.chainToProvider(chainId);
    let tx = await rpcProvider.getTransaction(txHash);

    const retryTime = 10;
    let retryCount = 0;

    while (retryCount < retryTime) {
      tx = await rpcProvider.getTransaction(txHash);
      if (tx) {
        return tx.wait();
      } else {
        retryCount++;
        console.log('retry get TX: ', retryCount);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
  }

  public async getTransactionInfo(
    chainId: number,
    txHash: string,
    standard: NftStandardEnum,
  ) {
    try {
      const rpcProvider = this.chainToProvider(chainId);
      const tx = await rpcProvider.getTransaction(txHash);
      const data = tx.data;

      let iface;
      switch (standard) {
        case NftStandardEnum.ERC1155:
          iface = new ethers.utils.Interface(ERC1155MarketABI);
          break;
        case NftStandardEnum.ERC721:
          iface = new ethers.utils.Interface(ERC721CollectionABI);
      }
      return iface.parseTransaction({ data });
    } catch (e) {
      return { args: { _signature: '' }, name: '' };
    }
  }

  public async getCollectionEvents(
    chainId: number,
    address: string,
    txHash: string,
  ) {
    const txReceipt = await this.getTransactionReceipt(chainId, txHash);
    const iface = new ethers.utils.Interface(
      this.nftStandard == NftStandardEnum.ERC721
        ? ERC721CollectionABI
        : ERC1155CollectionABI,
    );
    const logs = txReceipt.logs.filter(
      (log) => log.address.toLowerCase() === address.toLowerCase(),
    );
    return logs
      .map((log) => iface.parseLog(log))
      .map((log, index) => ({
        ...log,
        address,
        index,
      }));
  }

  public async getMarketEvents(chainId: number, txHash: string) {
    const address = this.chainIdToMarketAddress(chainId);
    const txReceipt = await this.getTransactionReceipt(chainId, txHash);
    const iface = new ethers.utils.Interface(
      this.nftStandard == NftStandardEnum.ERC721
        ? ERC721MarketABI
        : ERC1155MarketABI,
    );
    const logs = txReceipt.logs.filter(
      (log) => log.address.toLowerCase() === address.toLowerCase(),
    );
    return logs
      .map((log) => iface.parseLog(log))
      .map((log, index) => ({
        ...log,
        address,
        index,
      }));
  }

  public async getAllEvents(
    chainId: number,
    collectionAddress: string,
    txHash: string,
  ) {
    const collectionEvents = await this.getCollectionEvents(
      chainId,
      collectionAddress,
      txHash,
    );
    const marketEvents = await this.getMarketEvents(chainId, txHash);
    return [...collectionEvents, ...marketEvents];
  }

  public async getBlockNumber(chainId: number, txHash: string) {
    const rpcProvider = this.chainToProvider(chainId);
    const tx = await rpcProvider.getTransaction(txHash);
    await tx.wait();
    return tx.blockNumber;
  }
}
