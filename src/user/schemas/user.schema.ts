import { prop, Ref } from '@typegoose/typegoose';
import { Exclude } from 'class-transformer';
import { BaseModel } from '../../global/base.model';

export class User extends BaseModel {
  @prop()
  username: string;

  @prop()
  @Exclude()
  password: string;

  @prop()
  email: string;

  @prop({ default: 'Unnamed' })
  displayName: string;

  @prop()
  nonce: string;

  @prop()
  address: string;
}
