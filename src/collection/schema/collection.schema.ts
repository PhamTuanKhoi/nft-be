import { prop, Ref } from '@typegoose/typegoose';
import { User } from 'src/user/schemas/user.schema';

export class Collection {
  @prop({ required: true })
  name: string;

  @prop()
  symbol: string;

  @prop()
  image: string;

  @prop({ ref: () => User, required: true })
  creator: Ref<User>;
}
