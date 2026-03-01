import { NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCollectionDto } from 'src/core/dtos/collection/create-collection.dto';
import { CollectionEntity } from 'src/core/entities/collection.entity';
import { Repository } from 'typeorm';
import { UpdateCollectionDto } from 'src/core/dtos/collection/update-collection.dto';
import { COLLECTION_RELATIONS } from 'src/core/relations/collection.relation';

@Injectable()
export class CollectionRepository {
  constructor(
    @InjectRepository(CollectionEntity)
    private readonly collectionRepository: Repository<CollectionEntity>,
  ) {}

  async create(dto: CreateCollectionDto): Promise<CollectionEntity> {
    const collection = this.collectionRepository.create(dto);
    return await this.collectionRepository.save(collection);
  }

  async findOne(id: number): Promise<CollectionEntity> {
    const collection = await this.collectionRepository.findOne({
      where: { id },
      relations: COLLECTION_RELATIONS,
    });

    if (!collection) {
      throw new NotFoundException('Collection not found.');
    }

    return collection;
  }

  async findAll(): Promise<CollectionEntity[]> {
    return await this.collectionRepository.find({
      order: { createdAt: 'DESC' },
      relations: COLLECTION_RELATIONS,
    });
  }

  async update(id: number, dto: UpdateCollectionDto): Promise<CollectionEntity> {
    await this.findOne(id);
    const collection = this.collectionRepository.create(dto);
    return await this.collectionRepository.save(collection);
  }

  async remove(id: number): Promise<CollectionEntity> {
    const collection = await this.findOne(id);

    await this.collectionRepository.softDelete(id);

    return collection;
  }
}
