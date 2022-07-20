import { IsEnum, IsNumber, IsString } from 'class-validator';
import { IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDto {
  @IsOptional()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsString()
  sortBy: string;

  @IsOptional()
  @IsNumber()
  @IsEnum([-1, 1])
  sortType: number;
}
