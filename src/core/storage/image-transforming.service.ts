import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { IMAGE_MAX_WIDTH, IMAGE_WEBP_QUALITY } from 'src/core/constants/image.constant';

export interface TransformedImage {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

@Injectable()
export class ImageTransformingService {
  async transform(input: Buffer): Promise<TransformedImage> {
    const buffer = await sharp(input)
      .resize({ width: IMAGE_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: IMAGE_WEBP_QUALITY })
      .toBuffer();

    const metadata = await sharp(buffer).metadata();

    return {
      buffer,
      width: metadata.width,
      height: metadata.height,
      size: buffer.length,
      mimeType: 'image/webp',
    };
  }
}
