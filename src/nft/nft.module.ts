import { Module } from "@nestjs/common";
import { TypegooseModule } from "nestjs-typegoose";
import { NftContrller } from "./nft.controller";
import { NftService } from "./nft.service";
import { NFT } from "./schema/nft.schema";

@Module({
    imports: [TypegooseModule.forFeature([NFT])],
    controllers: [NftContrller],
    providers: [NftService],
    exports: [NftService]
})
export class NftModule{}