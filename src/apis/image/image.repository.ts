import { NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateImageDto } from 'src/core/dtos/image/create-image.dto';
import { ImageEntity } from 'src/core/entities/image.entity';
import { Repository } from 'typeorm';
// import { UpdateImageDto } from 'src/core/dtos/image/update-image.dto';

@Injectable()
export class ImageRepository {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,
  ) {}

  async create(dto: CreateImageDto): Promise<ImageEntity> {
    const image = this.imageRepository.create(dto);
    return await this.imageRepository.save(image);
  }

  async findOne(id: number): Promise<ImageEntity> {
    const image = await this.imageRepository.findOne({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image not found.');
    }

    return image;
  }

  async findAll(): Promise<ImageEntity[]> {
    return await this.imageRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // async update(id: number, dto: UpdateImageDto): Promise<ImageEntity> {
  //   await this.findOne(id);
  //   const image = this.imageRepository.create(dto);
  //   return await this.imageRepository.save(image);
  // }

  async remove(id: number): Promise<ImageEntity> {
    const image = await this.findOne(id);

    await this.imageRepository.softDelete(id);

    return image;
  }
}
