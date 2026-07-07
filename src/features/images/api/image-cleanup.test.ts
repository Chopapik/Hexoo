import { describe, expect, it, vi } from "vitest";
import type { ImageMeta } from "../types/image.type";
import {
  deleteImages,
  deleteImageWithRetry,
  rollbackUploadedImage,
} from "./image-cleanup";

const imageMeta = (fileName: string): ImageMeta => ({
  storageBucket: "media-bucket",
  storageLocation: "comments/user-1",
  fileName,
  downloadToken: `token-${fileName}`,
  contentType: "image/webp",
  sizeBytes: 1234,
});

describe("image-cleanup", () => {
  it("does not call the deleter for nullish metadata", async () => {
    const deleteImage = vi.fn();

    await expect(deleteImageWithRetry(null, deleteImage)).resolves.toBeUndefined();
    await expect(
      deleteImageWithRetry(undefined, deleteImage),
    ).resolves.toBeUndefined();

    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("retries and succeeds on the second attempt", async () => {
    const meta = imageMeta("retry-success.webp");
    const firstError = new Error("temporary storage failure");
    const deleteImage = vi
      .fn()
      .mockRejectedValueOnce(firstError)
      .mockResolvedValueOnce(undefined);

    await expect(deleteImageWithRetry(meta, deleteImage)).resolves.toBeUndefined();

    expect(deleteImage).toHaveBeenCalledTimes(2);
    expect(deleteImage).toHaveBeenNthCalledWith(1, meta);
    expect(deleteImage).toHaveBeenNthCalledWith(2, meta);
  });

  it("throws the last terminal retry error", async () => {
    const meta = imageMeta("terminal-failure.webp");
    const firstError = new Error("first failure");
    const lastError = new Error("last failure");
    const deleteImage = vi
      .fn()
      .mockRejectedValueOnce(firstError)
      .mockRejectedValueOnce(lastError);

    await expect(deleteImageWithRetry(meta, deleteImage)).rejects.toBe(
      lastError,
    );
  });

  it("rethrows the original rollback error when there is no uploaded image", async () => {
    const originalError = new Error("create comment failed");
    const deleteImage = vi.fn();

    await expect(
      rollbackUploadedImage(null, originalError, deleteImage),
    ).rejects.toBe(originalError);

    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("wraps rollback cleanup failures with both original and cleanup errors", async () => {
    const meta = imageMeta("rollback-failure.webp");
    const originalError = new Error("db insert failed");
    const cleanupError = new Error("storage cleanup failed");
    const deleteImage = vi.fn().mockRejectedValue(cleanupError);

    await expect(
      rollbackUploadedImage(meta, originalError, deleteImage),
    ).rejects.toMatchObject({
      code: "EXTERNAL_SERVICE",
      details: {
        originalError,
        cleanupError,
        imageMeta: meta,
      },
    });

    expect(deleteImage).toHaveBeenCalledTimes(2);
  });

  it("deletes images in order", async () => {
    const first = imageMeta("first.webp");
    const second = imageMeta("second.webp");
    const third = imageMeta("third.webp");
    const deleteImage = vi.fn().mockResolvedValue(undefined);

    await expect(
      deleteImages([first, second, third], deleteImage),
    ).resolves.toBeUndefined();

    expect(deleteImage).toHaveBeenNthCalledWith(1, first);
    expect(deleteImage).toHaveBeenNthCalledWith(2, second);
    expect(deleteImage).toHaveBeenNthCalledWith(3, third);
  });

  it("stops bulk deletion on terminal failure", async () => {
    const first = imageMeta("first.webp");
    const failing = imageMeta("failing.webp");
    const skipped = imageMeta("skipped.webp");
    const lastError = new Error("second image still failing");
    const deleteImage = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("second image first failure"))
      .mockRejectedValueOnce(lastError)
      .mockResolvedValueOnce(undefined);

    await expect(deleteImages([first, failing, skipped], deleteImage)).rejects.toBe(
      lastError,
    );

    expect(deleteImage).toHaveBeenCalledTimes(3);
    expect(deleteImage).toHaveBeenNthCalledWith(1, first);
    expect(deleteImage).toHaveBeenNthCalledWith(2, failing);
    expect(deleteImage).toHaveBeenNthCalledWith(3, failing);
  });
});
