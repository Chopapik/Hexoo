import { createAppError } from "@/lib/AppError";
import {
  IMAGE_UPLOAD_ALLOWED_MIME_TYPES,
  IMAGE_UPLOAD_MAX_BYTES,
} from "../image-resource-policy";

export type ImageResourceMetadata = {
  width?: number;
  height?: number;
  pages?: number;
};

export type ImageMetadataProbe = (
  input: Buffer,
) => Promise<ImageResourceMetadata>;

export type ImageResourceLimits = {
  maxBytes: number;
  maxWidth: number;
  maxHeight: number;
  maxPixels: number;
  maxFrames: number;
  probeTimeoutMs: number;
  allowedMimeTypes: readonly string[];
};

const positiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const IMAGE_RESOURCE_LIMITS: ImageResourceLimits = {
  maxBytes: positiveInteger(
    process.env.IMAGE_UPLOAD_MAX_BYTES,
    IMAGE_UPLOAD_MAX_BYTES,
  ),
  maxWidth: positiveInteger(process.env.IMAGE_UPLOAD_MAX_WIDTH, 8_192),
  maxHeight: positiveInteger(process.env.IMAGE_UPLOAD_MAX_HEIGHT, 8_192),
  maxPixels: positiveInteger(process.env.IMAGE_UPLOAD_MAX_PIXELS, 40_000_000),
  maxFrames: positiveInteger(process.env.IMAGE_UPLOAD_MAX_FRAMES, 100),
  probeTimeoutMs: positiveInteger(
    process.env.IMAGE_UPLOAD_PROBE_TIMEOUT_MS,
    5_000,
  ),
  allowedMimeTypes: IMAGE_UPLOAD_ALLOWED_MIME_TYPES,
};

export const IMAGE_UPLOAD_MAX_BODY_BYTES = positiveInteger(
  process.env.IMAGE_UPLOAD_MAX_BODY_BYTES,
  IMAGE_RESOURCE_LIMITS.maxBytes + 1024 * 1024,
);
export const IMAGE_PROCESSING_TIMEOUT_MS = positiveInteger(
  process.env.IMAGE_UPLOAD_PROCESSING_TIMEOUT_MS,
  5_000,
);

export type PreparedImageUpload = {
  file: File | Blob;
  inputBuffer: Buffer;
  metadata: Required<ImageResourceMetadata>;
};

function validationError(reason: string) {
  return createAppError({
    code: "VALIDATION_ERROR",
    message: `[imageResourceLimits] ${reason}`,
    data: { reason },
  });
}

export function assertImageUploadRequestSize(
  headers: Pick<Headers, "get">,
  maxBodyBytes = IMAGE_UPLOAD_MAX_BODY_BYTES,
): void {
  const rawLength = headers.get("content-length");
  if (!rawLength) throw validationError("missing_content_length");
  const length = Number(rawLength);
  if (!Number.isSafeInteger(length) || length <= 0) {
    throw validationError("invalid_content_length");
  }
  if (length > maxBodyBytes) throw validationError("request_body_too_large");
}

async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(validationError("metadata_probe_timeout")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function withImageProcessingTimeout<T>(
  operation: Promise<T>,
  timeoutMs = IMAGE_PROCESSING_TIMEOUT_MS,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(validationError("image_processing_timeout")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function prepareImageUpload(
  file: File | Blob,
  probe: ImageMetadataProbe,
  limits: ImageResourceLimits = IMAGE_RESOURCE_LIMITS,
): Promise<PreparedImageUpload> {
  // These checks deliberately precede arrayBuffer(), metadata decoding, Sharp,
  // storage and moderation provider calls.
  if (!limits.allowedMimeTypes.includes(file.type)) {
    throw validationError("unsupported_mime_type");
  }
  if (file.size <= 0) throw validationError("empty_file");
  if (file.size > limits.maxBytes) throw validationError("file_too_large");

  let inputBuffer: Buffer;
  try {
    inputBuffer = Buffer.from(await file.arrayBuffer());
  } catch (error) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[imageResourceLimits] failed_to_read_file",
      details: error,
      data: { reason: "failed_to_read_file" },
    });
  }

  let probed: ImageResourceMetadata;
  try {
    probed = await withTimeout(probe(inputBuffer), limits.probeTimeoutMs);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "VALIDATION_ERROR"
    ) {
      throw error;
    }
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[imageResourceLimits] invalid_image_metadata",
      details: error,
      data: { reason: "invalid_image_metadata" },
    });
  }

  const width = probed.width ?? 0;
  const height = probed.height ?? 0;
  const pages = probed.pages ?? 1;
  if (width <= 0 || height <= 0) throw validationError("missing_dimensions");
  if (width > limits.maxWidth || height > limits.maxHeight) {
    throw validationError("dimensions_too_large");
  }
  if (width * height > limits.maxPixels) {
    throw validationError("pixel_count_too_large");
  }
  if (pages <= 0 || pages > limits.maxFrames) {
    throw validationError("frame_count_too_large");
  }

  return {
    file,
    inputBuffer,
    metadata: { width, height, pages },
  };
}
