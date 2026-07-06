import { describe, expect, it } from "vitest";
import type { ImageMeta } from "../types/image.type";
import {
  buildObjectKey,
  imageMetaToJson,
  parseImageMeta,
} from "./imageMeta";

const imageMeta: ImageMeta = {
  storageBucket: "post-images",
  storageLocation: "posts/user-1",
  fileName: "image.webp",
  downloadToken: "download-token-1",
  contentType: "image/webp",
  sizeBytes: 12345,
  isAnimated: true,
};

describe("imageMeta", () => {
  describe("parseImageMeta", () => {
    it("rejects missing required fields", () => {
      for (const field of [
        "storageBucket",
        "storageLocation",
        "fileName",
        "downloadToken",
        "contentType",
        "sizeBytes",
      ] as const) {
        const raw = { ...imageMeta };
        delete raw[field];

        expect(parseImageMeta(raw)).toBeNull();
      }
    });

    it("trims leading slashes from storageLocation", () => {
      expect(
        parseImageMeta({
          ...imageMeta,
          storageLocation: "///posts/user-1",
        }),
      ).toEqual({
        ...imageMeta,
        storageLocation: "posts/user-1",
      });
    });
  });

  describe("buildObjectKey", () => {
    it("uses only the file name for an empty storageLocation", () => {
      expect(buildObjectKey({ ...imageMeta, storageLocation: "" })).toBe(
        "image.webp",
      );
    });

    it("normalizes leading and trailing slashes for nested folders", () => {
      expect(
        buildObjectKey({
          ...imageMeta,
          storageLocation: "/comments/user-2/thread-3/",
          fileName: "comment.png",
        }),
      ).toBe("comments/user-2/thread-3/comment.png");
    });
  });

  describe("imageMetaToJson", () => {
    it("serializes optional isAnimated when present", () => {
      expect(imageMetaToJson(imageMeta)).toEqual({
        storageBucket: "post-images",
        storageLocation: "posts/user-1",
        fileName: "image.webp",
        downloadToken: "download-token-1",
        contentType: "image/webp",
        sizeBytes: 12345,
        isAnimated: true,
      });
    });

    it("serializes nullish values to null", () => {
      expect(imageMetaToJson(null)).toBeNull();
      expect(imageMetaToJson(undefined)).toBeNull();
    });
  });
});
