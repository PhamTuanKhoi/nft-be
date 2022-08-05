import { prop, Ref } from '@typegoose/typegoose';
import { Exclude } from 'class-transformer';
import { BaseModel } from '../../global/base.model';

export class User extends BaseModel {
  @prop()
  cover: string;
  
  @prop()
  avatar: string;

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

  @prop({ required: true })
  address: string;

  @prop()
  bio: string;

  @prop()
  customUrl: string;

  @prop()
  facebook: string;

  @prop()
  twitter: string;

  @prop()
  discord: string;
}
