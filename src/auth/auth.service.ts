import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ID } from '../global/interfaces/id.interface';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from 'src/user/dtos/register-user.dto';
import { ethers } from 'ethers';
import { JwtPayload } from './interface/jwtPayload.interface';
import { User } from '../user/schemas/user.schema';
import { ResetToken } from './schemas/resetToken.schema';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ResetPasswordDto } from '../user/dtos/reset-password.dto';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from 'src/user/dtos/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(ResetToken)
    private readonly tokenModel: ReturnModelType<typeof ResetToken>,
  ) {}

  async credentialByPassword(
    username: string,
    password: string,
  ): Promise<User> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user)
      throw new HttpException(
        'User not found, please register',
        HttpStatus.NOT_FOUND,
      );

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      throw new HttpException(
        'password is not correct',
        HttpStatus.UNAUTHORIZED,
      );

    return user;
  }

  async genTokenFromUsername(username: string) {
    const user: any = await this.usersService.findOneByUsername(username);
    const payload: JwtPayload = {
      username: user.username,
      id: user._id,
      address: user.address,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async genTokenFromSign(address: string) {
    const user = await this.usersService.findByAddress(address);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // const addressFromSign = ethers.utils.verifyMessage(user.nonce);
    // if (addressFromSign !== address)
    //   throw new HttpException('Invalid sign', HttpStatus.BAD_REQUEST);

    const payload: JwtPayload = {
      username: user.username,
      id: user._id,
      address,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerUser: RegisterUserDto) {
    return this.usersService.create(registerUser);
  }

  async getUserFromJwtPayload({ id }: JwtPayload) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async resetRequest(email: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user)
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    const token = await this.tokenModel.findOne({ userId: user.id });
    if (token) await token.deleteOne();
    const resetToken = randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);

    await new this.tokenModel({
      userId: user.id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const domain = this.configService.get<string>('FRONTEND_URL');
    const link = `${domain}/passwordReset?token=${resetToken}&id=${user.id}`;
    //TODO: send email
  }
}
