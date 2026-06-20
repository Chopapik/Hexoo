import { randomUUID } from "crypto";
import { createAppError } from "@/lib/AppError";
import sharp from "sharp";
import { SupabaseImageStorageRepository } from "./image.supabase.repository";
import { buildObjectKey } from "../utils/imageMeta";
import type { ImageMeta } from "../types/image.type";
import type { ImageUploadResult } from "./imageService.interface";
import {
  prepareImageUpload,
  type PreparedImageUpload,
  withImageProcessingTimeout,
} from "./image-resource-limits";

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

export const defaultImageMetadataProbe = async (input: Buffer) => {
  const metadata = await sharp(input, { animated: true }).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    pages: metadata.pages,
  };
};

export const prepareImage = async (
  file: File | Blob,
): Promise<PreparedImageUpload> =>
  prepareImageUpload(file, defaultImageMetadataProbe);

export const uploadPreparedImage = async (
  prepared: PreparedImageUpload,
  uid: string,
  storageFolder: string,
): Promise<ImageUploadResult> => {
  let processedBuffer: Buffer;
  const isAnimated = prepared.metadata.pages > 1;

  try {
    processedBuffer = await withImageProcessingTimeout(
      sharp(prepared.inputBuffer, { animated: true })
        .resize(1920, 1920, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer(),
    );
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
  const objectKey = storageLocation
    ? `${storageLocation}/${fileName}`
    : fileName;
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
      isAnimated,
    };

    return {
      ...meta,
      publicUrl: result.publicUrl,
    };
  } catch (error) {
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "[imageService.uploadImage] Failed to upload image to storage",
      details: error,
    });
  }
};

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
  return uploadPreparedImage(await prepareImage(file), uid, storageFolder);
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
      details: { error, meta },
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
