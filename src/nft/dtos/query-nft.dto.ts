import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { QueryDto } from 'src/global/dtos/query.dto';

export class QueryNftDto extends QueryDto {
  @IsOptional()
  @IsString()
  @Type(() => String)
  fileType: string;

  @IsOptional()
  @IsString()
  endTime: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  level: Number;
}
