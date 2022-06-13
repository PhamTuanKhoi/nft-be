import { SaleNFTDto } from './dtos/saleNFT.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ID } from '../global/interfaces/id.interface';
import { ParseIdPipe } from '../global/pipes/parseId.pipe';
import { NftService } from './nft.service';
import { QueryNFTDto } from './dtos/queryNFT.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SaleService } from './sale.service';
import { GetRandomMetaDTO } from './dtos/getRandomMeta.dto';
import { MetadataService } from './metadata.service';
import { BidService } from './bid.service';
import { CreateByTransactionDto } from './dtos/createByTransaction.dto';
import { ImportNFTDto } from './dtos/importNFT.dto';
import { CrawlService } from './crawl.service';
import { CreateLazyNFTDto } from './dtos/createLazyNFT.dto';

@ApiBearerAuth()
@ApiTags('NFT')
@Controller('nfts')
export class NftController {
  constructor(
    private readonly service: NftService,
    private readonly saleService: SaleService,
    private readonly metaService: MetadataService,
    private readonly bidService: BidService,
    private readonly crawlService: CrawlService,
  ) {}

  @ApiOperation({ summary: 'Get random metadata to mint' })
  @Post('metadata')
  async randomMeta(@Body() body: GetRandomMetaDTO) {
    return await this.metaService.getRandomMetadata(body.total);
  }

  @ApiOperation({ summary: 'Crawl transaction' })
  @Post('crawl')
  async crawlTransaction(@Body() body: CreateByTransactionDto) {
    return await this.crawlService.crawlTransaction(
      +body.chainId,
      body.transactionHash,
      body.address,
      body.standard,
    );
  }

  @Get('sales/search')
  async getSaleSearch(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query() query,
  ) {
    return await this.saleService.searchSale(page, limit, query);
  }

  @Patch('sales/:id')
  async updateSaleNFT(@Param('id') id: ID, @Body() saleNFT) {
    return await this.saleService.update(id, saleNFT);
  }

  @Post('/sales/increase-view/')
  async increaseView(@Body() body) {
    return this.saleService.increaseView(body);
  }

  @Get('sales/:id')
  async findSalesById(@Param('id') id: ID) {
    return this.saleService.findOne(id);
  }

  @ApiOperation({ summary: 'Get NFTs on sale' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get('sales')
  async getSales(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query() query,
  ) {
    return await this.saleService.findAll(page, limit, query);
  }

  @Get('followers/:id/:userId')
  async follow(@Param('id') id: ID, @Param('userId') userId: ID) {
    return this.service.follow(id, userId);
  }

  @Get()
  async index(@Query() query: QueryNFTDto) {
    return await this.service.findAll(query);
  }

  @ApiOperation({ summary: 'Get Top seller' })
  @Get('topseller')
  async getTopSeller() {
    return await this.saleService.getTopSeller();
  }

  @Get('feature')
  async getFeature() {
    return await this.saleService.getFeature();
  }

  @ApiOperation({ summary: 'Get NFT Sale by Collection' })
  @ApiParam({ name: 'id' })
  @Get('collection/sale/:id')
  async findCollectionNftSale(@Param('id', ParseIdPipe) id: ID) {
    return await this.saleService.findByCollection(id);
  }

  @ApiOperation({ summary: 'Get NFT by Collection' })
  @ApiParam({ name: 'id' })
  @Get('collection/:id')
  async findCollection(@Param('id', ParseIdPipe) id: ID) {
    return await this.service.findByCollection(id);
  }

  @ApiOperation({ summary: 'Get bids of sale' })
  @ApiParam({ name: 'id' })
  @Get('sales/:id/bids')
  async getBidsOfSale(@Param('id', new ParseIdPipe()) id: ID) {
    return this.bidService.findBySale(id);
  }

  @Get(':id/refresh')
  async refreshUri(@Param('id', ParseIdPipe) id: ID) {
    return this.service.refreshUri(id);
  }

  @ApiOperation({ summary: 'Get NFT' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  async find(@Param('id', ParseIdPipe) id: ID) {
    return await this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Import NFT' })
  @Post('import')
  async importNft(@Body() body: ImportNFTDto) {
    return this.service.importNft(
      body.ownerAddress,
      body.tokenAddress,
      body.tokenId,
      body.chainId,
      body.standard,
    );
  }

  @ApiOperation({ summary: 'Put on sale Lazy' })
  @Post('lazy')
  async putOnSaleLazy(@Body() body: CreateLazyNFTDto) {
    return this.saleService.putOnSaleLazy(body);
  }

  @ApiOperation({ summary: 'Take down Lazy' })
  @ApiParam({ name: 'id' })
  @Delete('lazy/:id')
  async takeDownLazy(@Param('id') id) {
    return this.saleService.takeDownLazy(id);
  }
}
