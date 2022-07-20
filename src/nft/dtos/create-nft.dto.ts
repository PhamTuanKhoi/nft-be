import { Ref } from "@typegoose/typegoose";
import { IsOptional, IsString, Length } from "class-validator";
import { ID } from "src/global/interfaces/id.interface";
import { User } from "src/user/schemas/user.schema";

export class CreateNftDto {
    @IsString()
    @Length(4, 50)
    name: string;

    @IsString()
    media: string;

    @IsString()
    fileType: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsString()
    creator: Ref<User>;

    @IsString()
    owner: Ref<User>;
}