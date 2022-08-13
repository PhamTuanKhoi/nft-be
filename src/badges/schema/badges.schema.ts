import { prop, Ref } from '@typegoose/typegoose';
import { User } from 'src/user/schemas/user.schema';

export class Badges {
  @prop()
  name: string;

  @prop()
  image: string;

  @prop()
  description: string;

  // @prop({ ref: () => User, required: true })
  // owner: Ref<User>;
}
