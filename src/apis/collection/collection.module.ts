import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { CollectionEntity } from 'src/core/entities/collection.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionRepository } from './collection.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionEntity])],
  controllers: [CollectionController],
  providers: [CollectionService, CollectionRepository],
})
export class CollectionModule {}
