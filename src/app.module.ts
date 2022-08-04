import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypegooseModule } from 'nestjs-typegoose';
import { UploadModule } from './upload/upload.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NftModule } from './nft/nft.module';
import { CollectionModule } from './collection/collection.module';
import { MiningModule } from './mining/mining.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypegooseModule.forRoot(process.env.MONGO),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    UploadModule,
    NftModule,
    CollectionModule,
    MiningModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
