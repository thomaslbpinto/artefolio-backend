import { NotFoundException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArtworkDto } from 'src/core/dtos/artwork/create-artwork.dto';
import { ArtworkEntity } from 'src/core/entities/artwork.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { UpdateArtworkDto } from 'src/core/dtos/artwork/update-artwork.dto';
import { ImageTransformingService } from 'src/core/storage/image-transforming.service';
import { StorageService } from 'src/core/storage/storage.service';
import { randomUUID } from 'crypto';
import { ImageEntity } from 'src/core/entities/image.entity';
import { ImageProviderEnum } from 'src/core/enums/image-provider.enum';
import { ARTWORK_RELATIONS } from 'src/core/relations/artwork.relation';

@Injectable()
export class ArtworkRepository {
  constructor(
    @InjectRepository(ArtworkEntity)
    private readonly artworkRepository: Repository<ArtworkEntity>,
    private readonly dataSource: DataSource,
    private readonly imageTransformingService: ImageTransformingService,
    private readonly storageService: StorageService,
  ) {}

  async create(dto: CreateArtworkDto, userId: number, images: Express.Multer.File[]): Promise<ArtworkEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let uploadedImagesKeys: string[] = [];

    try {
      const savedArtwork = await this.saveArtwork(queryRunner, dto, userId);
      uploadedImagesKeys = await this.uploadAndPersistImages(queryRunner, savedArtwork, images);

      await queryRunner.commitTransaction();

      return await this.findOne(savedArtwork.id);
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();

      for (const key of uploadedImagesKeys) {
        await this.storageService.deleteFile(key);
      }

      throw new InternalServerErrorException('Failed to create artwork.');
    } finally {
      await queryRunner.release();
    }
  }

  private async saveArtwork(queryRunner: QueryRunner, dto: CreateArtworkDto, userId: number): Promise<ArtworkEntity> {
    const artwork = queryRunner.manager.create(ArtworkEntity, {
      ...dto,
      user: { id: userId },
      collection: { id: dto.collectionId },
    });

    const saved = await queryRunner.manager.save(ArtworkEntity, artwork);

    if (!saved) {
      throw new InternalServerErrorException('Failed to create artwork.');
    }

    return saved;
  }

  private async uploadAndPersistImages(
    queryRunner: QueryRunner,
    savedArtwork: ArtworkEntity,
    images: Express.Multer.File[],
  ): Promise<string[]> {
    const uploadedKeys: string[] = [];

    for (let index = 0; index < images.length; index++) {
      const key = `artworks/${randomUUID()}.webp`;
      const file = images[index];
      const transformedImage = await this.imageTransformingService.transform(file.buffer);

      await this.storageService.uploadFile(key, transformedImage.buffer, transformedImage.mimeType);

      uploadedKeys.push(key);

      const imageEntity = queryRunner.manager.create(ImageEntity, {
        key,
        provider: ImageProviderEnum.CLOUDFLARE,
        mimeType: transformedImage.mimeType,
        size: transformedImage.size,
        width: transformedImage.width,
        height: transformedImage.height,
        order: index + 1,
        artwork: savedArtwork,
      });

      await queryRunner.manager.save(ImageEntity, imageEntity);
    }

    return uploadedKeys;
  }

  async findOne(id: number): Promise<ArtworkEntity> {
    const artwork = await this.artworkRepository.findOne({
      where: { id },
      relations: ARTWORK_RELATIONS,
    });

    if (!artwork) {
      throw new NotFoundException('Artwork not found.');
    }

    return artwork;
  }

  async findAll(): Promise<ArtworkEntity[]> {
    return await this.artworkRepository.find({
      order: { createdAt: 'DESC' },
      relations: ARTWORK_RELATIONS,
    });
  }

  async update(id: number, dto: UpdateArtworkDto): Promise<ArtworkEntity> {
    await this.findOne(id);
    const artwork = this.artworkRepository.create(dto);
    return await this.artworkRepository.save(artwork);
  }

  async remove(id: number): Promise<ArtworkEntity> {
    const artwork = await this.findOne(id);

    await this.artworkRepository.softDelete(id);

    return artwork;
  }
}
