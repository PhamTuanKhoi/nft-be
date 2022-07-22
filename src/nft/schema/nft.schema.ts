import { prop, Ref } from '@typegoose/typegoose';
import { User } from 'src/user/schemas/user.schema';

export class NFT {
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

  @prop({ default: 1 })
  level: number;

  @prop({ default: 0 })
  endTime: number;
}
