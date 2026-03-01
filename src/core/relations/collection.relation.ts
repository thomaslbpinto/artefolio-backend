import { FindOptionsRelations } from 'typeorm';
import { CollectionEntity } from '../entities/collection.entity';

export const COLLECTION_RELATIONS: FindOptionsRelations<CollectionEntity> = {
  artworks: { images: true },
  user: true,
};
