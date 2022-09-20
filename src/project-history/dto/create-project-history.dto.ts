import { IsOptional } from 'class-validator';

export class CreateProjectHistoryDto {
  @IsOptional()
  datelike: number;

  @IsOptional()
  user: string;

  @IsOptional()
  project: string;
}
