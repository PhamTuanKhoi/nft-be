import { Ref } from '@typegoose/typegoose';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { BaseModel } from 'src/global/base.model';
import { User } from 'src/user/schemas/user.schema';

export class CreateCollectionDto extends BaseModel {
  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsString()
  image: string;

  @Type(() => String)
  @IsString()
  creator: Ref<User>;
}
