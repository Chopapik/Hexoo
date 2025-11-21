import admin from "firebase-admin";
import { randomUUID } from "crypto";
import { createAppError } from "@/lib/ApiError";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
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

const normalizeFile = async (file: any) => {
  if (!file) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "No file provided",
    });
  }

  if (typeof file.arrayBuffer === "function") {
    // Browser File
    const ab = await file.arrayBuffer().catch((err: any) => {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "Failed to read file",
        details: err,
      });
    });

    return {
      buffer: Buffer.from(ab),
      contentType: file.type || "application/octet-stream",
      originalName: file.name || "upload",
    };
  }

  if (file?.buffer && Buffer.isBuffer(file.buffer)) {
    // multer-like
    return {
      buffer: file.buffer,
      contentType: file.mimetype || "application/octet-stream",
      originalName: file.originalname || "upload",
    };
  }

  if (Buffer.isBuffer(file)) {
    return {
      buffer: file,
      contentType: "application/octet-stream",
      originalName: "upload",
    };
  }

  throw createAppError({
    code: "INVALID_INPUT",
    message: "Unsupported file format",
  });
};

export const uploadImage = async (file: any, uid = "anon") => {
  ensureBucket();

  const { buffer, contentType, originalName } = await normalizeFile(file);

  if (!buffer.length) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "Empty file",
    });
  }

  if (buffer.length > MAX_IMAGE_BYTES) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "Image too large",
    });
  }

  if (contentType && !ALLOWED_TYPES.includes(contentType)) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "Unsupported image type",
    });
  }

  const ts = Date.now();
  const ext = originalName.split(".").pop() || "bin";
  const id = randomUUID();
  const storagePath = `${STORAGE_FOLDER}/${uid}_${ts}_${id}.${ext}`;
  const downloadToken = randomUUID();

  const metadata = {
    contentType,
    metadata: { firebaseStorageDownloadTokens: downloadToken },
  };

  try {
    await bucket.file(storagePath).save(buffer, {
      metadata,
      resumable: false,
    });

    const bucketName = bucket.name;
    const emulatorHost =
      process.env.STORAGE_EMULATOR_HOST ||
      process.env.FIREBASE_STORAGE_EMULATOR_HOST;

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
      contentType,
      sizeBytes: buffer.length,
    };
  } catch (err) {
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "Failed to upload image",
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
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "Failed to delete image",
      details: err,
    });
  }
};

export const hasFile = (f: any): boolean => {
  if (!f) return false;
  if (typeof f.size === "number") return f.size > 0;
  if (f?.buffer && Buffer.isBuffer(f.buffer)) return f.buffer.length > 0;
  if (Buffer.isBuffer(f)) return f.length > 0;
  return false;
};
