import { prop, Ref } from "@typegoose/typegoose";
import { User } from "src/user/schemas/user.schema";

export class NFT {
    @prop({ required: true, minlength: 4, maxlength: 50, type: String })
    name: string;

    @prop({ required: true, type: String })
    media: string;

    @prop({ required: true, type: String })
    fileType: string;

    @prop({ type: String })
    description: string;

    @prop({ ref: () => User, required: true })
    creator: Ref<User>;

    @prop({ ref: () => User, require: true })
    owner: Ref<User>;
}