import { createAppError } from "@/lib/AppError";
import type { ImageMeta } from "../types/image.type";

export type ImageDeleter = (
  meta: ImageMeta | null | undefined,
) => Promise<void>;

export async function deleteImageWithRetry(
  imageMeta: ImageMeta | null | undefined,
  deleteImage: ImageDeleter,
  attempts = 2,
): Promise<void> {
  if (!imageMeta) return;
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await deleteImage(imageMeta);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/**
 * Compensates a newly uploaded object while retaining both failures if the
 * cleanup itself fails. Successful cleanup preserves the original error.
 */
export async function rollbackUploadedImage(
  imageMeta: ImageMeta | null | undefined,
  originalError: unknown,
  deleteImage: ImageDeleter,
): Promise<never> {
  if (!imageMeta) throw originalError;
  try {
    await deleteImageWithRetry(imageMeta, deleteImage);
  } catch (cleanupError) {
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "[imageCleanup] Upload rollback failed",
      details: { originalError, cleanupError, imageMeta },
    });
  }
  throw originalError;
}

export async function deleteImages(
  imageMetas: readonly (ImageMeta | null | undefined)[],
  deleteImage: ImageDeleter,
): Promise<void> {
  for (const imageMeta of imageMetas) {
    await deleteImageWithRetry(imageMeta, deleteImage);
  }
}
