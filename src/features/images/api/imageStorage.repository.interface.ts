export interface ImageStorageUploadResult {
  publicUrl: string;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
}

export interface ImageStorageRepository {
  uploadObject(
    bucket: string,
    objectKey: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<ImageStorageUploadResult>;

  deleteObject(bucket: string, objectKey: string): Promise<void>;
}
