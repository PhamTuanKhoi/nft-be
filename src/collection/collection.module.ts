import { forwardRef, Module } from '@nestjs/common';
import { Collection } from './schemas/collection.schema';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { TypegooseModule } from 'nestjs-typegoose';
import { NftModule } from 'src/nft/nft.module';

@Module({
  imports: [
    TypegooseModule.forFeature([Collection]),
    forwardRef(() => NftModule),
  ],
  controllers: [CollectionController],
  providers: [CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}
