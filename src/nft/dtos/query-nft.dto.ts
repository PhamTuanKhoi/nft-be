import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { QueryDto } from 'src/global/dtos/query.dto';

export class QueryNftDto extends QueryDto {
  @IsOptional()
  @IsString()
  @Type(() => String)
  fileType: string;
}
