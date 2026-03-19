import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateImageDto } from 'src/core/dtos/image/create-image.dto';
import { ImageResponseDto } from 'src/core/dtos/image/image-response.dto';
import { ImageRepository } from './image.repository';
import { UpdateImageDto } from 'src/core/dtos/image/update-image.dto';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';

@Injectable()
export class ImageService {
  constructor(private readonly imageRepository: ImageRepository) {}

  async create(dto: CreateImageDto): Promise<ImageResponseDto> {
    return plainToInstance(ImageResponseDto, await this.imageRepository.create(dto), CLASS_TRANSFORMER_OPTIONS);
  }

  async findOne(id: number): Promise<ImageResponseDto> {
    return plainToInstance(ImageResponseDto, await this.imageRepository.findOne(id), CLASS_TRANSFORMER_OPTIONS);
  }

  async findAll(): Promise<ImageResponseDto[]> {
    return plainToInstance(ImageResponseDto, await this.imageRepository.findAll(), CLASS_TRANSFORMER_OPTIONS);
  }

  async update(id: number, dto: UpdateImageDto): Promise<ImageResponseDto> {
    return plainToInstance(ImageResponseDto, await this.imageRepository.update(id, dto), CLASS_TRANSFORMER_OPTIONS);
  }

  async remove(id: number): Promise<ImageResponseDto> {
    return plainToInstance(ImageResponseDto, await this.imageRepository.remove(id), CLASS_TRANSFORMER_OPTIONS);
  }
}
