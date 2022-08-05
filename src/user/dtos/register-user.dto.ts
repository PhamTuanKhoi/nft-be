import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class RegisterUserDto {
  @IsOptional()
  @IsString()
  @Type(() => String)
  cover: string;


  @IsOptional()
  @IsString()
  @Type(() => String)
  avatar: string;

  @IsEmail()
  @Type(() => String)
  email: string;

  @IsString()
  @Type(() => String)
  @Length(2, 100)
  username: string;

  @IsString()
  @Type(() => String)
  @Length(4, 30)
  password: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  @Length(2, 30)
  displayName: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  bio: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  customUrl: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  facebook: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  twitter: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  discord: string;
}
