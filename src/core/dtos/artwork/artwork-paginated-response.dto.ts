import { Expose, Type } from 'class-transformer';
import { ArtworkResponseDto } from './artwork-response.dto';
import { PaginationDto } from '../pagination.dto';

export class ArtworkPaginatedResponseDto {
  @Expose()
  @Type(() => ArtworkResponseDto)
  artworks: ArtworkResponseDto[];

  @Expose()
  @Type(() => PaginationDto)
  pagination: PaginationDto;
}
