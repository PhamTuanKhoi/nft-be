import { Ref } from '@typegoose/typegoose';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseModel } from 'src/global/base.model';
import { User } from 'src/user/schemas/user.schema';

export class CreateNftDto extends BaseModel {
  @IsString()
  name: string;

  @IsString()
  media: string;

  @IsEnum(['image', 'video', 'audio'])
  fileType: string;

  @IsOptional()
  description: string;

  @IsString()
  creator: Ref<User>;

  @IsString()
  owner: Ref<User>;

  @IsOptional()
  @IsNumber()
  level: number;

  @IsOptional()
  @IsNumber()
  endTime: number;
}
