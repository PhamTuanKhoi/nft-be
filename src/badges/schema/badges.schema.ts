import { prop } from "@typegoose/typegoose";

export class Badges {
    @prop()
    name: string;

    @prop()
    image: string;

    @prop()
    description: string;
}
