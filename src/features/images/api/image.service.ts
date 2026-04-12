import { randomUUID } from "crypto";
import { createAppError } from "@/lib/AppError";
import sharp from "sharp";
import { SupabaseImageStorageRepository } from "./image.supabase.repository";
import { buildObjectKey } from "../utils/imageMeta";
import type { ImageMeta } from "../types/image.type";
import type { ImageUploadResult } from "./imageService.interface";

const storageRepository = new SupabaseImageStorageRepository();

function requireBucket(): string {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucket) {
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "[imageService] SUPABASE_STORAGE_BUCKET is not configured",
    });
  }
  return bucket;
}

export const uploadImage = async (
  file: File | Blob,
  uid: string,
  storageFolder: string,
): Promise<ImageUploadResult> => {
  if (!file) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[imageService.uploadImage] No file provided",
    });
  }

  let inputBuffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    inputBuffer = Buffer.from(arrayBuffer);
  } catch (e) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[imageService.uploadImage] Failed to read file",
    });
  }

  let processedBuffer: Buffer;
  try {
    processedBuffer = await sharp(inputBuffer)
      .resize(1920, 1920, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message:
        "[imageService.uploadImage] Invalid image file or format not supported",
      details: error,
    });
  }

  const bucket = requireBucket();
  const ts = Date.now();
  const id = randomUUID();
  const fileName = `${uid}_${ts}_${id}.webp`;
  const storageLocation = storageFolder.replace(/^\/+/, "").replace(/\/+$/, "");
  const objectKey = storageLocation ? `${storageLocation}/${fileName}` : fileName;
  const downloadToken = randomUUID();

  try {
    const result = await storageRepository.uploadObject(
      bucket,
      objectKey,
      processedBuffer,
      "image/webp",
    );

    const meta: ImageMeta = {
      storageBucket: bucket,
      storageLocation,
      fileName,
      downloadToken,
      contentType: result.contentType,
      sizeBytes: result.sizeBytes,
    };

    return {
      ...meta,
      publicUrl: result.publicUrl,
    };
  } catch (error) {
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "[imageService.uploadImage] Failed to upload image to storage",
    });
  }
};

export const deleteImage = async (
  meta: ImageMeta | null | undefined,
): Promise<void> => {
  if (!meta) return;
  try {
    await storageRepository.deleteObject(
      meta.storageBucket,
      buildObjectKey(meta),
    );
  } catch (error) {
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "[imageService.deleteImage] Failed to delete image from storage",
    });
  }
};

export const hasFile = (f: unknown): f is File | Blob => {
  if (!f) return false;
  if (
    typeof f === "object" &&
    f !== null &&
    "size" in f &&
    typeof (f as { size: unknown }).size === "number"
  ) {
    return (f as { size: number }).size > 0;
  }
  return false;
};
