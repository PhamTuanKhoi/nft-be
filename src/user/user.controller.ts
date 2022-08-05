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

@ApiBearerAuth()
@ApiTags('USER')
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  async index(@Query() query: QueryUserDto) {
    return await this.service.findAll(query);
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

  // @Patch(':a/follow/:b')
  // async follow(@Param('a', ParseIdPipe) a: ID, @Param('b', ParseIdPipe) b: ID) {
  //   return await this.service.follow(a, b);
  // }

  // @Patch(':a/unfollow/:b')
  // async unFollow(
  //   @Param('a', ParseIdPipe) a: ID,
  //   @Param('b', ParseIdPipe) b: ID,
  // ) {
  //   return await this.service.unFollow(a, b);
  // }

  // @Patch()
  // async createOrUpdate(@Body() payload: UpdateUserDto) {
  //   return await this.service.createOrUpdate(payload);
  // }

  @Get('/address/:address')
  async findByAddress(@Param('address') address: string) {
    return await this.service.findByAddress(address);
  }

  @Post('/nonce')
  async getNonce(@Body() payload: { address: string }) {
    return await this.service.findOrCreateByAddress(payload.address);
  }

  @Patch(':id')
  async update(@Param('id') id: ID, @Body() user) {
    return await this.service.update(id, user);
  }
}
