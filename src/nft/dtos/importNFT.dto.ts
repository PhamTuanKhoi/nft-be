import {IsEnum, IsNumber, IsString, IsUrl} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {NftStandardEnum} from "../interfaces/nftStandard.enum";

export class ImportNFTDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  tokenId: number;

  @ApiProperty()
  @IsString()
  tokenAddress: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  chainId: number;

  @ApiProperty()
  @IsString()
  ownerAddress: string;

  @ApiProperty({ enum: NftStandardEnum })
  @IsEnum(NftStandardEnum)
  standard: NftStandardEnum;
}
