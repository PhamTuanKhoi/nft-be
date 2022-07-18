import { IsEnum, IsOptional, IsString } from "class-validator";

export class CreateNftDto {
    @IsString()
    name: string;
    @IsString()
    media: string;
    @IsEnum(["image", "video", "audio"])
    fileType: string;
    @IsOptional()
    description: string;
}