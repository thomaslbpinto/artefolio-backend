import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';
import { ImageProviderEnum } from '../../enums/image-provider.enum';

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  key: string;

  @IsEnum(ImageProviderEnum)
  @IsNotEmpty()
  provider: ImageProviderEnum;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  mimeType: string;

  @IsInt()
  @Min(0)
  size: number;

  @IsInt()
  @Min(0)
  width: number;

  @IsInt()
  @Min(0)
  height: number;

  @IsInt()
  @Min(1)
  order: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  artworkId?: number;
}
