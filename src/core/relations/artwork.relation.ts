import { FindOptionsRelations } from 'typeorm';
import { ArtworkEntity } from '../entities/artwork.entity';

export const ARTWORK_RELATIONS: FindOptionsRelations<ArtworkEntity> = {
  images: true,
  collection: true,
  user: true,
};
