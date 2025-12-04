import admin from "firebase-admin";
import { randomUUID } from "crypto";
import { createAppError } from "@/lib/ApiError";
import sharp from "sharp";

const STORAGE_FOLDER = "posts";
const bucket = admin.storage().bucket();

const ensureBucket = () => {
  if (!bucket) {
    throw createAppError({
      code: "SERVICE_UNAVAILABLE",
      message: "Storage bucket is not configured",
    });
  }
};

export const uploadImage = async (file: File | Blob, uid = "anon") => {
  ensureBucket();

  if (!file) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "No file provided",
    });
  }

  let inputBuffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    inputBuffer = Buffer.from(arrayBuffer);
  } catch (e) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "Failed to read file",
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
  } catch (err) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "Invalid image file or format not supported",
      details: err,
    });
  }

  const ts = Date.now();
  const id = randomUUID();
  const storagePath = `${STORAGE_FOLDER}/${uid}_${ts}_${id}.webp`;
  const downloadToken = randomUUID();

  try {
    const fileRef = bucket.file(storagePath);

    await fileRef.save(processedBuffer, {
      metadata: {
        contentType: "image/webp",
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
      resumable: false,
    });

    const bucketName = bucket.name;
    const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST;

    const publicUrl = emulatorHost
      ? `http://${emulatorHost}/v0/b/${bucketName}/o/${encodeURIComponent(
          storagePath
        )}?alt=media&token=${downloadToken}`
      : `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
          storagePath
        )}?alt=media&token=${downloadToken}`;

    return {
      publicUrl,
      storagePath,
      downloadToken,
      contentType: "image/webp",
      sizeBytes: processedBuffer.length,
    };
  } catch (err) {
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "Failed to upload image to storage",
      details: err,
    });
  }
};

export const deleteImage = async (storagePath: string | null | undefined) => {
  if (!storagePath) return;
  ensureBucket();
  try {
    await bucket
      .file(storagePath)
      .delete()
      .catch((err: any) => {
        if (err?.code === 404) return;
        throw err;
      });
  } catch (err) {
    console.warn("Failed to delete image", err);
  }
};

export const hasFile = (f: any): boolean => {
  if (!f) return false;
  if (typeof f.size === "number") return f.size > 0;
  return false;
};
