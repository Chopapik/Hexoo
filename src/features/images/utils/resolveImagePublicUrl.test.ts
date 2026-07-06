import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ImageMeta } from "../types/image.type";
import { resolveImagePublicUrl } from "./resolveImagePublicUrl";

const storageMock = vi.hoisted(() => ({
  from: vi.fn(),
  getPublicUrl: vi.fn(),
}));

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: {
    storage: {
      from: storageMock.from,
    },
  },
}));

const imageMeta: ImageMeta = {
  storageBucket: "comment-images",
  storageLocation: "/comments/user-7/thread-9/",
  fileName: "reply.webp",
  downloadToken: "download-token-2",
  contentType: "image/webp",
  sizeBytes: 67890,
};

describe("resolveImagePublicUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMock.from.mockReturnValue({
      getPublicUrl: storageMock.getPublicUrl,
    });
    storageMock.getPublicUrl.mockReturnValue({
      data: { publicUrl: "https://cdn.example.test/comment-images/reply.webp" },
    });
  });

  it("returns null for missing metadata without touching storage", () => {
    expect(resolveImagePublicUrl(null)).toBeNull();
    expect(resolveImagePublicUrl(undefined)).toBeNull();
    expect(storageMock.from).not.toHaveBeenCalled();
  });

  it("uses the metadata bucket and normalized object key", () => {
    expect(resolveImagePublicUrl(imageMeta)).toBe(
      "https://cdn.example.test/comment-images/reply.webp",
    );

    expect(storageMock.from).toHaveBeenCalledWith("comment-images");
    expect(storageMock.getPublicUrl).toHaveBeenCalledWith(
      "comments/user-7/thread-9/reply.webp",
    );
  });
});
