import { Expose, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ArtworkTechniqueEnum } from 'src/core/enums/artwork/artwork-technique.enum';
import { ArtworkGenreEnum } from 'src/core/enums/artwork/artwork-genre.enum';
import { ArtworkTypeEnum } from 'src/core/enums/artwork/artwork-type.enum';
import { ToArray } from 'src/core/decorators/to-array.decorator';
import { MAX_ARTWORK_GENRES, MAX_ARTWORK_TECHNIQUES } from 'src/core/constants/artwork.constant';

export class FindAllArtworksFiltersDto {
  @Expose()
  @IsOptional()
  @IsString()
  search?: string;

  @Expose()
  @IsOptional()
  @IsEnum(ArtworkTypeEnum)
  type?: ArtworkTypeEnum;

  @Expose()
  @IsOptional()
  @ToArray<ArtworkTechniqueEnum>()
  @IsArray()
  @ArrayMaxSize(MAX_ARTWORK_TECHNIQUES)
  @IsEnum(ArtworkTechniqueEnum, { each: true })
  technique?: ArtworkTechniqueEnum[];

  @Expose()
  @IsOptional()
  @ToArray<ArtworkGenreEnum>()
  @IsArray()
  @ArrayMaxSize(MAX_ARTWORK_GENRES)
  @IsEnum(ArtworkGenreEnum, { each: true })
  genre?: ArtworkGenreEnum[];

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  country?: string;

  @Expose()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  yearMin?: number;

  @Expose()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  yearMax?: number;
}
