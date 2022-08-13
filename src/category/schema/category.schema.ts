import { Prop } from '@typegoose/typegoose';
import { Type } from 'class-transformer';

export class Category {
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
