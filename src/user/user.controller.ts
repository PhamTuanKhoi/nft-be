import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { QueryUserDto } from './dtos/query-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ID } from '../global/interfaces/id.interface';
import { ParseIdPipe } from '../global/pipes/parseId.pipe';
import { ListNftDto } from './dtos/listNft.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './schemas/user.schema';
import { RegisterUserDto } from './dtos/register-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';

@ApiBearerAuth()
@ApiTags('USER')
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  async index(@Query() query: QueryUserDto) {
    return await this.service.findAll(query);
  }

  @Get('ranking')
  async ranking() {
    return await this.service.ranking();
  }

  @Get('power/:id/:nft')
  async updatePower(@Param('id') id: string, @Param('nft') nft: string) {
    return await this.service.updatePower(id, nft);
  }

  @Get('likes/:id')
  async getUserLikes(@Param('id') id: string) {
    return await this.service.getUserLikes(id);
  }

  @Get('/address/:address')
  async findByAddress(@Param('address') address: string) {
    return await this.service.findByAddress(address);
  }
  @Get('/:id/nfts')
  @ApiOperation({ summary: 'list nft' })
  @ApiResponse({
    status: 200,
  })
  @ApiParam({ name: 'id' })
  async getNfts(@Param('id', ParseIdPipe) id: ID, @Query() query: ListNftDto) {
    return;
  }

  @Get(':id')
  @ApiOperation({ summary: 'get profile by ID' })
  @ApiResponse({
    status: 200,
  })
  @ApiParam({ name: 'id' })
  async find(@Param('id', ParseIdPipe) id: ID) {
    return await this.service.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIdPipe) id: ID) {
    return await this.service.remove(id);
  }

  @Post('/nonce')
  async getNonce(@Body() payload: { address: string }) {
    return await this.service.findOrCreateByAddress(payload.address);
  }

  @Post('')
  async create(@Body() user: CreateUserDto) {
    return await this.service.create(user);
  }

  @Patch(':id')
  async update(@Param('id') id: ID, @Body() user: UpdateUserDto) {
    return await this.service.update(id, user);
  }
}
