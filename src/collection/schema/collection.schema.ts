import { prop, Ref } from '@typegoose/typegoose';
import { NFT } from 'src/nft/schema/nft.schema';
import { User } from 'src/user/schemas/user.schema';

export class Collection {
  @prop({ required: true })
  name: string;

  @prop()
  symbol: string;

  @prop()
  image: string;

  @prop()
  banner: string;

  @prop({ ref: () => NFT })
  nfts: Ref<NFT>[];

  @prop({ ref: () => User })
  creator: Ref<User>;
}
