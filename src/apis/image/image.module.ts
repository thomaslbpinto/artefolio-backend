import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { ImageEntity } from 'src/core/entities/image.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageRepository } from './image.repository';
import { StorageModule } from 'src/core/storage/storage.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([ImageEntity]), StorageModule],
  controllers: [ImageController],
  providers: [ImageService, ImageRepository, ConfigService],
})
export class ImageModule {}
