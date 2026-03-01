import { Expose, Type } from 'class-transformer';
import { ArtworkTypeEnum } from '../../enums/artwork/artwork-type.enum';
import { ArtworkTechniqueEnum } from '../../enums/artwork/artwork-technique.enum';
import { ArtworkGenreEnum } from '../../enums/artwork/artwork-genre.enum';
import { VisibilityEnum } from '../../enums/visibility.enum';
import { CollectionResponseDto } from '../collection/collection-response.dto';
import { ImageResponseDto } from '../image/image-response.dto';
import { UserResponseDto } from '../user/user-response.dto';

export class ArtworkResponseDto {
  @Expose()
  id: number;

  @Expose()
  type: ArtworkTypeEnum;

  @Expose()
  title: string;

  @Expose()
  description?: string;

  @Expose()
  year?: number;

  @Expose()
  country?: string;

  @Expose()
  technique?: ArtworkTechniqueEnum[];

  @Expose()
  genre?: ArtworkGenreEnum[];

  @Expose()
  physicalHeight?: number;

  @Expose()
  physicalWidth?: number;

  @Expose()
  physicalDepth?: number;

  @Expose()
  digitalHeight?: number;

  @Expose()
  digitalWidth?: number;

  @Expose()
  fileSize?: number;

  @Expose()
  materials?: string;

  @Expose()
  tools?: string;

  @Expose()
  tags?: string[];

  @Expose()
  visibility: VisibilityEnum;

  @Expose()
  @Type(() => ImageResponseDto)
  images: ImageResponseDto[];

  @Expose()
  @Type(() => CollectionResponseDto)
  collection?: CollectionResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt?: Date;
}
