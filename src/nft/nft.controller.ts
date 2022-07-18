import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ID } from "src/global/interfaces/id.interface";
import { CreateNftDto } from "./dtos/create-nft.dto";
import { QueryNftDto } from "./dtos/query-nft.dto";
import { UpdateNftDto } from "./dtos/update-nft.dto";
import { NftService } from "./nft.service";

// PATH: v1/nfts
@Controller("nfts")
export class NftContrller {
    constructor(
        private readonly service: NftService
    ) { }
    // GET: /v1/nfts/:id
    // get nft by id
    @Get(":id")
    async getById(@Param("id") id: ID) {
        return await this.service.getById(id);
    }
    // GET: /v1/nfts/
    // get all nft
    @Get()
    async get(@Query() query: QueryNftDto) {
        return await this.service.get(query);
    }
    // POST: /v1/nfts/
    // create nft
    @Post()
    async create(@Body() nft: CreateNftDto) {
        return this.service.create(nft);
    }
    // PATCH: /v1/nfts/:id
    // uppdate nft by id
    @Patch(":id")
    async update(@Param("id") id: ID, @Body() nft: UpdateNftDto) {
        return this.service.update(id, nft);
    }
    // PATCH: /v1/nfts/:id
    // uppdate nft by id
    @Delete(":id")
    async delete(@Param("id") id: ID) {
        return this.service.delete(id);
    }
}