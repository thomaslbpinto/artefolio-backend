import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateCollectionDto } from 'src/core/dtos/collection/create-collection.dto';
import { CollectionResponseDto } from 'src/core/dtos/collection/collection-response.dto';
import { CollectionRepository } from './collection.repository';
import { UpdateCollectionDto } from 'src/core/dtos/collection/update-collection.dto';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';

@Injectable()
export class CollectionService {
  constructor(private readonly collectionRepository: CollectionRepository) {}

  async create(dto: CreateCollectionDto): Promise<CollectionResponseDto> {
    return plainToInstance(
      CollectionResponseDto,
      await this.collectionRepository.create(dto),
      CLASS_TRANSFORMER_OPTIONS,
    );
  }

  async findOne(id: number): Promise<CollectionResponseDto> {
    return plainToInstance(
      CollectionResponseDto,
      await this.collectionRepository.findOne(id),
      CLASS_TRANSFORMER_OPTIONS,
    );
  }

  async findAll(): Promise<CollectionResponseDto[]> {
    return plainToInstance(CollectionResponseDto, await this.collectionRepository.findAll(), CLASS_TRANSFORMER_OPTIONS);
  }

  async update(id: number, dto: UpdateCollectionDto): Promise<CollectionResponseDto> {
    return plainToInstance(
      CollectionResponseDto,
      await this.collectionRepository.update(id, dto),
      CLASS_TRANSFORMER_OPTIONS,
    );
  }

  async remove(id: number): Promise<CollectionResponseDto> {
    return plainToInstance(
      CollectionResponseDto,
      await this.collectionRepository.remove(id),
      CLASS_TRANSFORMER_OPTIONS,
    );
  }
}
