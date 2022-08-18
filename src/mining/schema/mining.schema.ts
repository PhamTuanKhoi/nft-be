import { Prop } from '@typegoose/typegoose';
import { Type } from 'class-transformer';
import { BaseModel } from 'src/global/base.model';

export class Mining extends BaseModel {
  @Prop({ required: true })
  @Type(() => Number)
  level: number;

  @Prop({ required: true })
  @Type(() => Number)
  price: number;

  @Prop({ required: true })
  @Type(() => Number)
  multiplier: number;

  @Prop({ required: true })
  @Type(() => Number)
  miningTime: number;
}
