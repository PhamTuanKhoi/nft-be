import { prop, Ref } from '@typegoose/typegoose';
import { User } from 'src/user/schemas/user.schema';

export class NFT {
  @prop({ required: true, minlength: 4, maxlength: 50, type: String })
  name: string;

  @prop({ required: true, type: String })
  media: string;

  @prop({ required: true, type: String })
  fileType: string;

  @prop({ type: String, maxlength: 200 })
  description: string;

  @prop({ ref: () => User, required: true })
  creator: Ref<User>;

  @prop({ ref: () => User })
  owner: Ref<User>;

  @prop({ default: 1 })
  level: number;

  @prop({ default: 0 })
  endTime: number;
}
