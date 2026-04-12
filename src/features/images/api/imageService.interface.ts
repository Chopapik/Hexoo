import type { ImageMeta } from "../types/image.type";

export type ImageUploadResult = ImageMeta & { publicUrl: string };

export interface ImageService {
  uploadImage(
    file: File | Blob,
    uid: string,
    storageFolder: string,
  ): Promise<ImageUploadResult>;
  deleteImage(meta: ImageMeta | null | undefined): Promise<void>;
  hasFile(file: unknown): boolean;
}
