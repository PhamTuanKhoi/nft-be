import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ProblemStatusEnum } from "../schema/problem.schema";

export class CreateProblemDto {
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
    @IsEnum(ProblemStatusEnum)
    status: ProblemStatusEnum;

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
