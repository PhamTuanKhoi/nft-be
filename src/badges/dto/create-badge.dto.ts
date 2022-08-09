import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBadgeDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    image: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    owner: string;
}
