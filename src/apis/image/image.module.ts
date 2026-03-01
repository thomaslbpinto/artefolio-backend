import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { ImageEntity } from 'src/core/entities/image.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageRepository } from './image.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ImageEntity])],
  controllers: [ImageController],
  providers: [ImageService, ImageRepository],
})
export class ImageModule {}
