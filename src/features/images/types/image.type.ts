export interface ImageMeta {
  storageBucket: string;
  storageLocation: string;
  fileName: string;
  downloadToken: string;
  contentType: string;
  sizeBytes: number;
  isAnimated?: boolean;
}
