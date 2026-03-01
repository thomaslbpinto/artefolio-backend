export abstract class StorageService {
  abstract uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string>;
  abstract deleteFile(key: string): Promise<void>;
}
