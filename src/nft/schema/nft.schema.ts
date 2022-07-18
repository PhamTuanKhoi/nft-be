import { prop } from "@typegoose/typegoose";

export class NFT {
    @prop({ required: true })
    name: string;
    @prop({ required: true })
    media: string;
    @prop({ enum: ["image", "video", "audio"] })
    fileType: string;
    @prop()
    description: string;
}