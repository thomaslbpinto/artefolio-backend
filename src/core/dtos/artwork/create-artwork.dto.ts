import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ArtworkGenreEnum } from '../../enums/artwork/artwork-genre.enum';
import { ArtworkTechniqueEnum } from '../../enums/artwork/artwork-technique.enum';
import { ArtworkTypeEnum } from '../../enums/artwork/artwork-type.enum';
import { VisibilityEnum } from '../../enums/visibility.enum';
import { ToArray } from 'src/core/decorators/to-array.decorator';
import { MAX_ARTWORK_GENRES, MAX_ARTWORK_TAGS, MAX_ARTWORK_TECHNIQUES } from 'src/core/constants/artwork.constant';

export class CreateArtworkDto {
  @IsEnum(ArtworkTypeEnum)
  @IsNotEmpty()
  type: ArtworkTypeEnum;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  country?: string;

  @IsOptional()
  @ToArray<ArtworkTechniqueEnum>()
  @IsArray()
  @ArrayMaxSize(MAX_ARTWORK_TECHNIQUES)
  @IsEnum(ArtworkTechniqueEnum, { each: true })
  technique?: ArtworkTechniqueEnum[];

  @IsOptional()
  @ToArray<ArtworkGenreEnum>()
  @IsArray()
  @ArrayMaxSize(MAX_ARTWORK_GENRES)
  @IsEnum(ArtworkGenreEnum, { each: true })
  genre?: ArtworkGenreEnum[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  physicalHeight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  physicalWidth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  physicalDepth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  digitalHeight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  digitalWidth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  fileSize?: number;

  @IsOptional()
  @IsString()
  materials?: string;

  @IsOptional()
  @IsString()
  tools?: string;

  @IsOptional()
  @ToArray<string>()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(MAX_ARTWORK_TAGS)
  @MaxLength(100, { each: true })
  tags?: string[];

  @IsEnum(VisibilityEnum)
  @IsNotEmpty()
  visibility: VisibilityEnum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  collectionId?: number;
}
