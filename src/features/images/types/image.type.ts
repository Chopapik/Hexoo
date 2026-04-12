/**
 * Image metadata stored in JSON (e.g. posts.image_meta, users.avatar_meta).
 * Storage identity is bucket + location + fileName — not publicUrl (URL base can change).
 */
export interface ImageMeta {
  storageBucket: string;
  /** Folder prefix inside the bucket, no leading slash (e.g. avatars, posts, comments). */
  storageLocation: string;
  fileName: string;
  downloadToken: string;
  contentType: string;
  sizeBytes: number;
}
