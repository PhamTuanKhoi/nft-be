import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { NftModule } from './nft/nft.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { TypegooseModule } from 'nestjs-typegoose';
import { MiningModule } from './mining/mining.module';
import { UploadModule } from './upload/upload.module';
import { HistoryModule } from './history/history.module';
import { CategoryModule } from './category/category.module';
import { CollectionModule } from './collection/collection.module';
import { ProblemCategoryModule } from './problem-category/problem-category.module';
import { ProjectModule } from './project/project.module';
import { BadgesModule } from './badges/badges.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypegooseModule.forRoot(process.env.MONGO),
    ScheduleModule.forRoot(),
    NftModule,
    UserModule,
    AuthModule,
    MiningModule,
    UploadModule,
    HistoryModule,
    CategoryModule,
    CollectionModule,
    ProblemCategoryModule,
    ProjectModule,
    BadgesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
