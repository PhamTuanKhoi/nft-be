import { Ref } from "@typegoose/typegoose";
import { IsNumber, IsOptional, IsString, Length } from "class-validator";
import { ID } from "src/global/interfaces/id.interface";
import { User } from "src/user/schemas/user.schema";

export class CreateNftDto {
    @IsString()
    @Length(2, 50)
    name: string;

    @IsString()
    media: string;

    @IsString()
    fileType: string;

    @IsOptional()
    @IsString()
    @Length(0, 200)
    description: string;

    @IsString()
    creator: Ref<User>;

    @IsString()
    owner: Ref<User>;

    @IsNumber()
    level: number;

    @IsNumber()
    endTime: number;
}