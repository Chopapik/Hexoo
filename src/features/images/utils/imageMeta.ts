import type { ImageMeta } from "../types/image.type";

export function buildObjectKey(meta: ImageMeta): string {
  const loc = meta.storageLocation.replace(/^\/+/, "").replace(/\/+$/, "");
  return loc ? `${loc}/${meta.fileName}` : meta.fileName;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}

/** Strict parse of DB jsonb — only the current ImageMeta shape. */
export function parseImageMeta(raw: unknown): ImageMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  if (
    !isNonEmptyString(o.storageBucket) ||
    typeof o.storageLocation !== "string" ||
    !isNonEmptyString(o.fileName) ||
    typeof o.downloadToken !== "string" ||
    !isNonEmptyString(o.contentType) ||
    !isNumber(o.sizeBytes)
  ) {
    return null;
  }

  return {
    storageBucket: o.storageBucket,
    storageLocation: o.storageLocation.replace(/^\/+/, ""),
    fileName: o.fileName,
    downloadToken: o.downloadToken,
    contentType: o.contentType,
    sizeBytes: o.sizeBytes,
  };
}
