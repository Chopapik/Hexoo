export interface ImageStorageUploadResult {
  publicUrl: string;
  storagePath: string;
  contentType: string;
  sizeBytes: number;
}

export interface ImageStorageRepository {
  uploadObject(
    storagePath: string,
    buffer: Buffer,
    contentType: string
  ): Promise<ImageStorageUploadResult>;

  deleteObject(storagePath: string): Promise<void>;
}
