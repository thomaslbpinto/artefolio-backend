import { Module } from '@nestjs/common';
import { ArtworkController } from './artwork.controller';
import { ArtworkService } from './artwork.service';
import { ArtworkEntity } from 'src/core/entities/artwork.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkRepository } from './artwork.repository';
import { ImageEntity } from 'src/core/entities/image.entity';
import { ImageTransformingService } from 'src/core/storage/image-transforming.service';
import { StorageModule } from 'src/core/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([ArtworkEntity, ImageEntity]), StorageModule],
  controllers: [ArtworkController],
  providers: [ArtworkService, ArtworkRepository, ImageTransformingService],
})
export class ArtworkModule {}
