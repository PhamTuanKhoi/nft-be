import { Prop } from '@typegoose/typegoose';
import { Type } from 'class-transformer';
import { BaseModel } from 'src/global/base.model';

export enum CategoryNameEnum {
  Art = 'Art',
  Music = 'Music',
  Collectibles = 'Collectibles',
  Sports = 'Sports',
}
export class Category extends BaseModel {
  @Prop({ required: true })
  title: CategoryNameEnum;

  @Prop()
  image: string;

  @Prop()
  method: string;

  @Prop()
  price: number;

  @Prop()
  description: string;

  @Prop()
  royalties: number;

  @Prop()
  size: string;

  // @Prop()
  // name: CategoryNameEnum;
}
