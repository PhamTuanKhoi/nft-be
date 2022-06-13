import { prop, Ref } from '@typegoose/typegoose';
import { BaseModel } from '../../global/base.model';
import { User } from 'src/user/schemas/user.schema';
import { NFT } from 'src/nft/schemas/nft.schema';

export class Comment extends BaseModel {
    @prop()
    content: string;

    @prop({ ref: () => User })
    user: Ref<User>;

    @prop({ ref: () => User })
    nft: Ref<NFT>;
}