import { Module, forwardRef } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypegooseModule } from 'nestjs-typegoose';
import { NftModule } from '../nft/nft.module';
import { MiningModule } from 'src/mining/mining.module';

@Module({
  imports: [
    TypegooseModule.forFeature([User]),
    forwardRef(() => NftModule),
    forwardRef(() => MiningModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
