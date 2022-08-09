import { BadRequestException, forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { UserService } from 'src/user/user.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { Badges } from './schema/badges.schema';

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);
  constructor(
    @InjectModel(Badges)
    private readonly model: ReturnModelType<typeof Badges>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ){}
  async create(createBadgeDto: CreateBadgeDto) {
    try {
      await this.userService.isModelExist(createBadgeDto.owner)
      const createdBages =  await this.model.create(createBadgeDto)
      this.logger.log(`created a new badges by id#${createdBages?._id}`)
      return createdBages;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }

  findAll() {
    try {
      return this.model.find();
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }

  findOne(id: string) {
    try {
      return this.model.findById(id);
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }

  async update(id: string, updateBadgeDto: UpdateBadgeDto) {
    try {
      await this.userService.isModelExist(updateBadgeDto.owner)
      const updated = await this.model.findByIdAndUpdate(id, updateBadgeDto, {new: true})
      this.logger.log(`updated badges by id#${updated._id}`)
      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }

  async remove(id: string) {
    try {
      const removed = await this.model.findByIdAndDelete(id)
      this.logger.log(`removed badges by id#${removed._id}`)
      return removed;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);   
    }
  }
}
