import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';


export class RegisterUserDto {
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
  @Length(4, 30)
  displayName: string;
}
