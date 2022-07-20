import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ID } from "src/global/interfaces/id.interface";
import { PaginateResponse } from "src/global/interfaces/paginate.interface";
import { CreateNftDto } from "./dtos/create-nft.dto";
import { QueryNftDto } from "./dtos/query-nft.dto";
import { UpdateNftDto } from "./dtos/update-nft-dto";
import { NftService } from "./nft.service";
import { NFT } from "./schema/nft.schema";

// config path: /v1/nfts
@Controller('nfts')
export class NftController {
    constructor(
        private readonly service: NftService
    ) { }

    //GET: /v1/nfts/
    // get all nft or filter
    @Get()
    async get(@Query() query: QueryNftDto): Promise<PaginateResponse<NFT>> {
        return this.service.get(query);
    }

    //POST: /v1/nfts/
    // create new nft
    @Post()
    async create(@Body() nft: CreateNftDto): Promise<NFT> {
        return await this.service.create(nft);
    }

    //PATCH: /v1/nfts/:id
    // update nft by id nft
    @Patch(":id")
    async update(@Param("id") id: ID, @Body() nft: UpdateNftDto): Promise<NFT> {
        return await this.service.update(id, nft);
    }

    //DELETE: /v1/nfts/:id
    // delete nft by id nft
    @Delete(":id")
    async delete(@Param("id") id: ID): Promise<NFT> {
        return await this.service.delete(id);
    }
}