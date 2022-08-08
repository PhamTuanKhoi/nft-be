import { IsNumber, IsOptional } from 'class-validator';
import { BaseModel } from 'src/global/base.model';

export class CreateCategoryDto extends BaseModel {
  @IsOptional()
  title: string;

  @IsOptional()
  image: string;

  @IsOptional()
  method: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  description: string;

  @IsOptional()
  @IsNumber()
  royalties: number;

  @IsOptional()
  size: string;
}
