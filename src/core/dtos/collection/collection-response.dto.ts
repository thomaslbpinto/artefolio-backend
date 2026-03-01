import { Expose, Type } from 'class-transformer';
import { VisibilityEnum } from '../../enums/visibility.enum';
import { UserResponseDto } from '../user/user-response.dto';
import { ArtworkResponseDto } from '../artwork/artwork-response.dto';

export class CollectionResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  visibility: VisibilityEnum;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  @Type(() => ArtworkResponseDto)
  artworks: ArtworkResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt?: Date;
}
