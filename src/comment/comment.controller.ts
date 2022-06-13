import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { Auth } from '../auth/decorator/auth.decorator';
import { ID } from '../global/interfaces/id.interface';
import { ParseIdPipe } from '../global/pipes/parseId.pipe';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';

@ApiBearerAuth()
@ApiTags('Comment')
@Controller('comments')
export class CommentController {
    constructor(private readonly service: CommentService) { }

    @Get("nft/:id")
    async getByNft(@Param("id") nftId, @Query() query) {
        return this.service.getByNft(nftId, query);
    }

    @Post()
    async create(@Body() comment) {
        return this.service.create(comment)
    }
}  