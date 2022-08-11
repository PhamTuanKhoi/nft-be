import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { QueryUserDto } from './dtos/query-user.dto';
import { PaginateResponse } from '../global/interfaces/paginate.interface';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ID } from '../global/interfaces/id.interface';
import * as crypto from 'crypto';
import { ethers } from 'ethers';
import { UserStatusEnum } from './interfaces/userStatus.enum';
import { v4 as uuidv4 } from 'uuid';
import { UserRoleEnum } from './interfaces/userRole.enum';
import { ProjectService } from 'src/project/project.service';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly model: ReturnModelType<typeof User>,
  ) // private readonly projects: ProjectService
  {}

  async findAll(query: QueryUserDto): Promise<PaginateResponse<User>> {
    let tmp = [];

    if (query.sortBy !== undefined && query.sortBy.length > 0) {
      tmp = [
        ...tmp,
        {
          $sort: {
            [query.sortBy]: query.sortType,
          },
        },
      ];
    } else {
      tmp = [
        ...tmp,
        {
          $sort: {
            createdAt: 1,
          },
        },
      ];
    }
    let findQuery = this.model.aggregate(tmp);
    const count = (await findQuery.exec()).length;
    if (
      query.limit !== undefined &&
      query.page !== undefined &&
      query.limit > 0 &&
      query.page > 0
    ) {
      findQuery = findQuery
        .limit(query.limit)
        .skip((query.page - 1) * query.limit);
    }

    const result = await findQuery.exec();
    return {
      items: result,
      paginate: {
        page: query.page || 0,
        limit: query.limit || 0,
        count,
      },
    };
  }

  async findOne(id: ID) {
    return await this.model.findById(id, { password: 0 }).exec();
  }

  async findOneById(id: ID) {
    return await this.model.findById(id, { password: 0 }).exec();
  }

  async findOwner(id: string) {
    return await this.model.findById(id, { password: 0 }).exec();
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.model.findOne({ email: email }, { password: 0 }).exec();
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return await this.model.findOne({ username }).exec();
  }

  async create(registerUser: RegisterUserDto): Promise<User> {
    const user = await this.model.findOne({ username: registerUser.username });

    if (user)
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);

    const newUser = new this.model(registerUser);
    newUser.password = await bcrypt.hash(registerUser.password, 10);

    const created = await newUser.save();
    return this.findOne(created.id);
  }

  async remove(id: ID): Promise<User> {
    return this.model.findByIdAndRemove(id);
  }

  async findOrCreateByAddress(address: string) {
    let sender = await this.findByAddress(address);

    if (!sender) {
      sender = await this.createByAddress(address);
    }
    return sender;
  }
  async isModelExist(id, isOptional = false, msg = '') {
    if (isOptional && !id) return;
    const errorMessage = msg || `id-> ${User.name} not found`;
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(errorMessage);
  }
  async findByAddress(address: string) {
    return this.model.findOne({
      address: address.toUpperCase(),
    });
  }

  async register(registerUser: RegisterUserDto): Promise<User> {
    if (registerUser.password !== registerUser.confirmPassword) {
      throw new HttpException(
        'Confirm password incorrect !',
        HttpStatus.BAD_REQUEST,
      );
    }
    const findUserByEmail = await this.model.findOne({
      email: registerUser.email,
    });

    if (findUserByEmail) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }
    const newUser = new this.model({
      ...registerUser,
      role: UserRoleEnum.ADMIN,
    });

    newUser.password = await bcrypt.hash(registerUser.password, 10);

    const created = await newUser.save();

    return this.findOne(created.id);
  }

  async createByAddress(address: string) {
    return this.model.create({
      address: address.toUpperCase(),
      username: address,
      password: Date.now().toString(),
      email: '',
      title: 'admin',
      status: UserStatusEnum.ACTIVE,
      avatar: '',
      cover: '',
      role: UserRoleEnum.USER,
      isCreator: false,
    });
  }

  async update(id, user) {
    return this.model.findByIdAndUpdate(id, user, { new: true });
  }
  // async generateOnceFromAddress(address: string) {
  //   const user = await this.findByAddress(address);
  //   if (user) {
  //     let nonce = crypto.randomBytes(16).toString('base64');
  //     nonce = ethers.utils.formatBytes32String(nonce);
  //     user.nonce = nonce;
  //     // await user.save();
  //     return nonce;
  //   }

  //   let nonce = crypto.randomBytes(16).toString('base64');
  //   nonce = ethers.utils.formatBytes32String(nonce);

  //   const newUser = new this.model({
  //     address: address.toUpperCase(),
  //     username: uuidv4(),
  //     title: 'Unnamed',
  //     status: UserStatusEnum.ACTIVE,
  //     nonce,
  //   });
  //   await newUser.save();
  //   return nonce;
  // }
}
