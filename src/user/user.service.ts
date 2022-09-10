import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
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
import { NftService } from 'src/nft/nft.service';
import { MiningService } from 'src/mining/mining.service';
import { CreateUserDto } from './dtos/create-user.dto';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User)
    private readonly model: ReturnModelType<typeof User>,
    @Inject(forwardRef(() => NftService))
    private readonly nftService: NftService,
    @Inject(forwardRef(() => MiningService))
    private readonly miningService: MiningService,
  ) {}

  async findAll(query: QueryUserDto): Promise<PaginateResponse<User>> {
    let tmp: any = [
      {
        $match: {
          role: {
            $ne: UserRoleEnum.ADMIN,
          },
        },
      },
      {
        $lookup: {
          from: 'winers',
          localField: '_id',
          foreignField: 'user',
          as: 'winers',
        },
      },
    ];

    if (query.search !== undefined && query.search.length > 0) {
      tmp = [
        ...tmp,
        {
          $match: {
            username: { $regex: '.*' + query.search + '.*', $options: 'i' },
          },
        },
      ];
    }
    if (
      query.sortBy !== undefined &&
      query.sortBy.length > 0 &&
      query.sortType
    ) {
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
        .skip((query.page - 1) * query.limit)
        .limit(query.limit);
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

  async ranking() {
    try {
      const result = await this.model.aggregate([
        {
          $match: {
            role: {
              $ne: UserRoleEnum.ADMIN,
            },
          },
        },
        {
          $lookup: {
            from: 'winers',
            localField: '_id',
            foreignField: 'user',
            pipeline: [
              {
                $lookup: {
                  from: 'badges',
                  localField: 'badges',
                  foreignField: '_id',
                  as: 'badges',
                },
              },
              { $unwind: '$badges' },
              { $sort: { 'badges.scores': -1 } },
            ],
            as: 'winers',
          },
        },
        {
          $group: {
            _id: {
              id: '$_id',
              avatar: '$avatar',
              name: '$displayName',
              power: '$power',
              winers: '$winers',
            },
          },
        },
        { $sort: { '_id.power': -1 } },
        {
          $project: {
            _id: 0,
            id: '$_id.id',
            avatar: '$_id.avatar',
            name: '$_id.name',
            power: '$_id.power',
            winers: '$_id.winers',
          },
        },
      ]);
      return result;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async coreteam(id: string) {
    try {
      const data = await this.model.aggregate([
        {
          $match: {
            $expr: {
              $eq: ['$_id', { $toObjectId: id }],
            },
          },
        },
        {
          $lookup: {
            from: 'nfts',
            localField: '_id',
            foreignField: 'owner',
            pipeline: [
              {
                $match: { mint: true },
              },
              {
                $match: { imported: true },
              },
              {
                $lookup: {
                  from: 'collections',
                  localField: 'collectionNft',
                  foreignField: '_id',
                  as: 'collections',
                },
              },
            ],
            as: 'nfts',
          },
        },
        {
          $unwind: '$nfts',
        },
        {
          $group: {
            _id: {
              id: '$_id',
              name: '$displayName',
              avatar: '$avatar',
              power: '$power',
              nfts: '$nfts',
            },
          },
        },
        {
          $project: {
            _id: 0,
            idMe: '$_id.id',
            name: '$_id.name',
            avatar: '$_id.avatar',
            power: '$_id.power',
            nfts: '$_id.nfts',
          },
        },
      ]);
      return data;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async getUserLikes(id) {
    try {
      return await this.model.aggregate([
        {
          $match: {
            $expr: {
              $eq: ['$_id', { $toObjectId: id }],
            },
          },
        },
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: 'likes',
            as: 'projects',
          },
        },
        {
          $lookup: {
            from: 'nfts',
            localField: '_id',
            foreignField: 'owner',
            as: 'Mined',
          },
        },
      ]);
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async isUpdatePower(id, payload) {
    const data = await this.findOne(id);
    if (!data) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    let isPower = data?.power + payload?.isPower;
    const updatedPower = await this.model.findByIdAndUpdate(
      id,
      { power: isPower },
      { new: true },
    );
    this.logger.log(`updated a power user by id#${updatedPower?._id}`);
    return updatedPower;
  }

  async updatePower(id: string, nft: string) {
    try {
      const isNft = await this.nftService.findOne(nft);
      if (!isNft) {
        throw new HttpException('Nft not found', HttpStatus.NOT_FOUND);
      }
      const mining = await this.miningService.getByLevel(isNft?.level);
      if (!mining) {
        throw new HttpException(
          `Mining not found level#${isNft?.level}`,
          HttpStatus.NOT_FOUND,
        );
      }
      let isPower = mining.price * mining.multiplier;
      const updatedPower = await this.isUpdatePower(id, { isPower });
      return updatedPower;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.model.findOne({ username: createUserDto.username });

    if (user)
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);

    const IsEmail = await this.model.findOne({ email: createUserDto.email });

    if (IsEmail) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    const isAddress = await this.findByAddress(createUserDto.address);

    if (isAddress) {
      throw new HttpException('Address already exists', HttpStatus.BAD_REQUEST);
    }

    const newUser = new this.model(createUserDto);

    const created = await newUser.save();
    return this.findOne(created._id);
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
      address: address,
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
      address: address,
      username: address,
      password: Date.now().toString(),
      email: '',
      status: UserStatusEnum.ACTIVE,
      avatar: '',
      cover: '',
      role: UserRoleEnum.USER,
      isCreator: false,
    });
  }

  async update(id: ID, user) {
    try {
      const updatedUser = await this.model.findByIdAndUpdate(id, user, {
        new: true,
      });
      this.logger.log(`updated a power user by id#${updatedUser?._id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async updateProfile(id: ID, payload: UpdateUserDto) {
    try {
      if (
        payload.email &&
        payload.emailOld &&
        payload.email !== payload.emailOld
      ) {
        const findUserByEmail = await this.model.findOne({
          email: payload.email,
        });
        if (findUserByEmail) {
          throw new HttpException(
            'Email already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      if (
        payload.password &&
        payload.confirmPassword &&
        payload.password !== payload.confirmPassword
      ) {
        throw new HttpException(
          'Confirm password incorrect !',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (
        payload.password &&
        payload.confirmPassword &&
        payload.password === payload.confirmPassword
      ) {
        payload.password = await bcrypt.hash(payload.password, 10);
      }
      const updatedUser = await this.model.findByIdAndUpdate(id, payload, {
        new: true,
      });
      this.logger.log(`updated a power user by id#${updatedUser?._id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
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
