import { prop, Ref } from '@typegoose/typegoose';
import { Collection } from 'src/collection/schema/collection.schema';
import { BaseModel } from 'src/global/base.model';
import { User } from 'src/user/schemas/user.schema';

export class NFT extends BaseModel {
  @prop({ required: true })
  name: string;

  @prop({ required: true })
  media: string;

  @prop({ enum: ['image', 'video', 'audio'] })
  fileType: string;

  @prop()
  description: string;

  @prop({ ref: () => User, required: true })
  creator: Ref<User>;

  @prop({ ref: () => User, required: true })
  owner: Ref<User>;

  @prop({ ref: () => Collection })
  collectionNft: Ref<Collection>;

  @prop({ default: 1 })
  level: number;

  @prop({ default: false })
  mint: boolean;

  @prop({ default: 0 })
  endTime: number;
}
