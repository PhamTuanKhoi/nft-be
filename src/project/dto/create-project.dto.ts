import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ProjectStatusEnum } from "../schema/project.schema";

export class CreateProjectDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    problemCategory: string;

    @IsOptional()
    @IsNumber()
    mintCost: number;

    @IsOptional()
    @IsNumber()
    endTime: number;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsEnum(ProjectStatusEnum)
    status: ProjectStatusEnum;

    @IsOptional()
    @IsString()
    address: string;

    @IsOptional()
    @IsNumber()
    miningValue: number;

    @IsOptional()
    @IsNumber()
    miningPower: number;

    // followers: Array<T>;

    // viewers: Array;
}
