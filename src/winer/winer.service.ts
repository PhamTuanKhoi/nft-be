import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { BadgesService } from 'src/badges/badges.service';
import { UserService } from 'src/user/user.service';
import { CreateWinerDto } from './dto/create-winer.dto';
import { UpdateWinerDto } from './dto/update-winer.dto';
import { Winer } from './schema/winer.schema';

@Injectable()
export class WinerService {
  private readonly logger = new Logger(WinerService.name);

  constructor(
    @InjectModel(Winer)
    private readonly model: ReturnModelType<typeof Winer>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => BadgesService))
    private readonly badgesService: BadgesService,
  ) {}

  async create(createWinerDto: CreateWinerDto) {
    try {
      await this.userService.isModelExist(createWinerDto.user);
      await this.badgesService.isModelExist(createWinerDto.badges);
      const createdWiner = await this.model.create(createWinerDto);
      this.logger.log(`created a new winer by id#${createdWiner?._id}`);
      return createdWiner;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findAll() {
    return `This action returns all winer`;
  }

  async findByUser(id: string) {
    try {
      return await this.model.find({ user: id }).populate('badges');
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} winer`;
  }

  update(id: number, updateWinerDto: UpdateWinerDto) {
    return `This action updates a #${id} winer`;
  }

  remove(id: number) {
    return `This action removes a #${id} winer`;
  }
}
