import { describe, expect, it } from "vitest";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { Json } from "@/lib/supabase.database.types";
import type {
  CreatePostPayload,
  UpdatePostPayload,
} from "../../../types/post.payload";
import type { PostRow } from "../../../types/post.row";
import { mapPostRow, toInsertRow, toUpdateRow } from "../post.supabase.mapper";

const imageMeta: ImageMeta = {
  storageBucket: "post-images",
  storageLocation: "posts/user-1",
  fileName: "post.webp",
  downloadToken: "download-token",
  contentType: "image/webp",
  sizeBytes: 12345,
  isAnimated: false,
};

const imageMetaJson: Json = {
  storageBucket: imageMeta.storageBucket,
  storageLocation: imageMeta.storageLocation,
  fileName: imageMeta.fileName,
  downloadToken: imageMeta.downloadToken,
  contentType: imageMeta.contentType,
  sizeBytes: imageMeta.sizeBytes,
  isAnimated: imageMeta.isAnimated,
};

function postRow(overrides: Partial<PostRow> = {}): PostRow {
  return {
    id: "post-1",
    user_id: "user-1",
    text: "Hello from the database",
    likes_count: 7,
    comments_count: 3,
    created_at: "2026-06-01T10:15:30.000Z",
    updated_at: "2026-06-02T11:16:31.000Z",
    is_pending: false,
    moderation_context: null,
    status: "visible",
    is_nsfw: true,
    is_edited: true,
    image_meta: null,
    image_url: "https://cdn.example.com/post.webp",
    device: "Web",
    youtube_url: "https://youtu.be/dQw4w9WgXcQ",
    ...overrides,
  };
}

describe("post.supabase.mapper", () => {
  describe("mapPostRow", () => {
    it("maps snake_case DB fields to camelCase entity fields", () => {
      const entity = mapPostRow(postRow());

      expect(entity).toMatchObject({
        id: "post-1",
        userId: "user-1",
        text: "Hello from the database",
        likesCount: 7,
        commentsCount: 3,
        updatedAt: new Date("2026-06-02T11:16:31.000Z"),
        isPending: false,
        moderationStatus: "visible",
        isNSFW: true,
        isEdited: true,
        imageMeta: undefined,
        imageUrl: "https://cdn.example.com/post.webp",
        device: "Web",
        youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
        userReports: undefined,
        reportsMeta: undefined,
      });
      expect(entity.createdAt).toEqual(new Date("2026-06-01T10:15:30.000Z"));
    });

    it("handles image metadata", () => {
      const entity = mapPostRow(
        postRow({
          image_meta: {
            ...imageMetaJson,
            storageLocation: "/posts/user-1",
          },
        }),
      );

      expect(entity.imageMeta).toEqual({
        ...imageMeta,
        storageLocation: "posts/user-1",
      });
    });

    it("maps null image URL to null", () => {
      const entity = mapPostRow(postRow({ image_url: null }));

      expect(entity.imageUrl).toBeNull();
    });

    it.each([
      ["invalid", "not-a-date"],
      ["missing", undefined],
    ])(
      "falls back to epoch date when created_at is %s",
      (_caseName, createdAt) => {
        const entity = mapPostRow(
          postRow({ created_at: createdAt as unknown as string }),
        );

        expect(entity.createdAt).toEqual(new Date(0));
      },
    );
  });

  describe("toInsertRow", () => {
    it("requires userId", () => {
      expect(() => toInsertRow({ text: "Missing user" })).toThrow(
        "userId is required",
      );
    });

    it("serializes Date values to ISO strings", () => {
      const createdAt = new Date("2026-06-03T12:00:00.000Z");
      const updatedAt = new Date("2026-06-03T12:30:00.000Z");

      const row = toInsertRow({
        userId: "user-1",
        createdAt,
        updatedAt,
      });

      expect(row.created_at).toBe("2026-06-03T12:00:00.000Z");
      expect(row.updated_at).toBe("2026-06-03T12:30:00.000Z");
    });

    it("serializes image metadata", () => {
      const row = toInsertRow({
        userId: "user-1",
        imageMeta,
      });

      expect(row.image_meta).toEqual(imageMetaJson);
    });

    it("converts empty YouTube URL to null", () => {
      const row = toInsertRow({
        userId: "user-1",
        youtubeUrl: "",
      });

      expect(row.youtube_url).toBeNull();
    });

    it("preserves explicit moderationContext null", () => {
      const row = toInsertRow({
        userId: "user-1",
        moderationContext: null,
      });

      expect(row).toHaveProperty("moderation_context", null);
    });
  });

  describe("toUpdateRow", () => {
    it("omits undefined fields", () => {
      const row = toUpdateRow({
        text: undefined,
        imageMeta: undefined,
        youtubeUrl: undefined,
        moderationContext: undefined,
        updatedAt: undefined,
      } as UpdatePostPayload);

      expect(row).toEqual({});
    });

    it("converts empty YouTube URL to null", () => {
      const row = toUpdateRow({
        youtubeUrl: "",
      });

      expect(row.youtube_url).toBeNull();
    });
  });
});
