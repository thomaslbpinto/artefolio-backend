import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class R2StorageService implements StorageService {
  private readonly client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.configService.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get('R2_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY')!,
      },
    });
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.configService.get('R2_BUCKET_NAME')!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return `${this.configService.get('R2_PUBLIC_URL')}/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get('R2_BUCKET_NAME')!,
        Key: key,
      }),
    );
  }
}
