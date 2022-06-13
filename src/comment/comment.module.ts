import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './schema/comment.schema';

@Module({
    imports: [TypegooseModule.forFeature([Comment])],
    controllers: [CommentController],
    providers: [CommentService],
    exports: [CommentService],
})
export class CommentModule { }
