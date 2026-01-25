export const POST_MAX_CHARS = 1000;

export interface ReportDetails {
  uid: string;
  reason: string;
  details?: string;
  createdAt: Date;
}

export interface ImageMeta {
  publicUrl: string;
  storagePath: string;
  downloadToken: string;
  contentType: string;
  sizeBytes: number;
}
