import { randomUUID } from "crypto";
import { createAppError } from "@/lib/AppError";
import sharp from "sharp";
import { SupabaseImageStorageRepository } from "./image.supabase.repository";

const storageRepository = new SupabaseImageStorageRepository();

export const uploadImage = async (
  file: File | Blob,
  uid: string,
  storageFolder: string
) => {
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

  const ts = Date.now();
  const id = randomUUID();
  const storagePath = `${storageFolder}/${uid}_${ts}_${id}.webp`;
  const downloadToken = randomUUID();

  try {
    const result = await storageRepository.uploadObject(
      storagePath,
      processedBuffer,
      "image/webp"
    );

    return {
      publicUrl: result.publicUrl,
      storagePath: result.storagePath,
      downloadToken,
      contentType: result.contentType,
      sizeBytes: result.sizeBytes,
    };
  } catch (error) {
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "[imageService.uploadImage] Failed to upload image to storage",
    });
  }
};

export const deleteImage = async (storagePath: string | null | undefined) => {
  if (!storagePath) return;
  try {
    await storageRepository.deleteObject(storagePath);
  } catch (error) {
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "[imageService.deleteImage] Failed to delete image from storage",
    });
  }
};

export const hasFile = (f: unknown): f is File | Blob => {
  if (!f) return false;
  if (typeof f === "object" && f !== null && "size" in f && typeof (f as { size: unknown }).size === "number") {
    return (f as { size: number }).size > 0;
  }
  return false;
};

