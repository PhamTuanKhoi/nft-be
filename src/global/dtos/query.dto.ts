import { IsNumber, IsString } from 'class-validator';
import { IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDto {

  @IsOptional()
  @IsString()
  @Type(() => String)
  search: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page: number;

  @IsOptional()
  @IsString()
  @Type(() => String)
  sortBy = 'createdAt';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([-1, 1])
  sortType = -1;
}
