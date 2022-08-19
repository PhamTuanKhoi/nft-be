import { Prop } from '@typegoose/typegoose';
import { Type } from 'class-transformer';
import { BaseModel } from 'src/global/base.model';

export class Category extends BaseModel {
  @Prop({ required: true })
  @Type(() => String)
  title: string;

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
}
