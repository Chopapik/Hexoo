export interface ImageUploadResult {
  publicUrl: string;
  storagePath: string;
  downloadToken: string;
  contentType: string;
  sizeBytes: number;
}

export interface IImageService {
  uploadImage(
    file: File | Blob,
    uid: string,
    storageFolder: string,
  ): Promise<ImageUploadResult>;
  deleteImage(storagePath: string | null | undefined): Promise<void>;
  hasFile(file: unknown): boolean;
}
