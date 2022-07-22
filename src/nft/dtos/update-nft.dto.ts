import { BaseModel } from 'src/global/base.model';
import { CreateNftDto } from './create-nft.dto';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Ref } from '@typegoose/typegoose';
import { User } from 'src/user/schemas/user.schema';

export class UpdateNftDto extends BaseModel {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  media: string;

  @IsOptional()
  @IsEnum(['image', 'video', 'audio'])
  fileType: string;

  @IsOptional()
  description: string;

  @IsOptional()
  @IsString()
  creator: Ref<User>;

  @IsOptional()
  @IsString()
  owner: Ref<User>;

  @IsOptional()
  @IsNumber()
  level: number;

  @IsOptional()
  @IsNumber()
  endTime: number;
}
