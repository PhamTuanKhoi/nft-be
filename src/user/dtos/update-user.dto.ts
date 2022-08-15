import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';

export class UpdateUserDto extends PartialType(RegisterUserDto) {
  @IsOptional()
  @IsString()
  @IsEmail()
  emailOld: string;
}
