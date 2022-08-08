import { prop } from "@typegoose/typegoose";

export class ProblemCategory {
    @prop()
    name: string;

    @prop()
    image: string;

    @prop()
    description: string;
}
