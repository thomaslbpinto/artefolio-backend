import { Expose, Transform } from 'class-transformer';
import { ImageProviderEnum } from '../../enums/image-provider.enum';

export class ImageResponseDto {
  @Expose()
  id: number;

  @Expose()
  key: string;

  @Expose()
  @Transform(({ obj }: { obj: ImageResponseDto }) => `${process.env.R2_PUBLIC_URL}/${obj.key}`)
  url?: string;

  @Expose()
  provider: ImageProviderEnum;

  @Expose()
  mimeType: string;

  @Expose()
  size: number;

  @Expose()
  width: number;

  @Expose()
  height: number;

  @Expose()
  order: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt?: Date;
}
