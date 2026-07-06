import { describe, expect, it } from "vitest";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { Json } from "@/lib/supabase.database.types";
import type {
  CreateCommentPayload,
  UpdateCommentPayload,
} from "../../../types/comment.payload";
import type { CommentRow } from "../../../types/comment.row";
import {
  mapCommentRow,
  toCreateCommentTxArgs,
  toUpdateRow,
} from "../comment.supabase.mapper";

const imageMeta: ImageMeta = {
  storageBucket: "comment-images",
  storageLocation: "comments/user-17",
  fileName: "comment.webp",
  downloadToken: "comment-token",
  contentType: "image/webp",
  sizeBytes: 23456,
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

function commentRow(overrides: Partial<CommentRow> = {}): CommentRow {
  return {
    id: "comment-101",
    post_id: "post-202",
    user_id: "user-303",
    text: "Mapped from database",
    likes_count: 5,
    comments_count: 8,
    created_at: "2026-07-01T10:15:30.000Z",
    updated_at: "2026-07-02T11:16:31.000Z",
    is_nsfw: true,
    is_pending: false,
    moderation_context: { source: "text" },
    status: "quarantined",
    is_edited: true,
    image_meta: null,
    image_url: "https://legacy.example.test/comment.webp",
    device: "iOS",
    ...overrides,
  };
}

describe("comment.supabase.mapper", () => {
  describe("mapCommentRow", () => {
    it("maps a full DB row to a comment entity with distinct values", () => {
      const entity = mapCommentRow(
        commentRow({
          image_meta: {
            ...imageMetaJson,
            storageLocation: "/comments/user-17",
          },
        }),
      );

      expect(entity).toMatchObject({
        id: "comment-101",
        postId: "post-202",
        userId: "user-303",
        text: "Mapped from database",
        likesCount: 5,
        commentsCount: 8,
        updatedAt: new Date("2026-07-02T11:16:31.000Z"),
        isNSFW: true,
        isPending: false,
        moderationStatus: "quarantined",
        isEdited: true,
        imageMeta,
        device: "iOS",
        userReports: undefined,
        reportsMeta: undefined,
      });
      expect(entity.createdAt).toEqual(new Date("2026-07-01T10:15:30.000Z"));
    });
  });

  describe("toCreateCommentTxArgs", () => {
    it("maps comment payload to all create RPC p_ fields", () => {
      const createdAt = new Date("2026-07-03T12:00:00.000Z");
      const updatedAt = new Date("2026-07-03T12:30:00.000Z");
      const moderationContext: Json = {
        status: "pending",
        reasons: ["toxicity"],
      };
      const payload: CreateCommentPayload = {
        postId: "ignored-post-from-payload",
        userId: "user-create-1",
        text: "Created comment",
        likesCount: 11,
        commentsCount: 13,
        createdAt,
        updatedAt,
        isNSFW: true,
        isPending: true,
        moderationStatus: "pending",
        isEdited: false,
        imageMeta,
        device: "Android",
        moderationContext,
      };

      expect(toCreateCommentTxArgs("post-create-1", payload)).toEqual({
        p_post_id: "post-create-1",
        p_user_id: "user-create-1",
        p_text: "Created comment",
        p_likes_count: 11,
        p_comments_count: 13,
        p_created_at: "2026-07-03T12:00:00.000Z",
        p_updated_at: "2026-07-03T12:30:00.000Z",
        p_is_nsfw: true,
        p_is_pending: true,
        p_moderation_context: moderationContext,
        p_image_url: null,
        p_image_meta: imageMetaJson,
        p_device: "Android",
      });
    });

    it("defaults counters and moderation flags for minimal comment payloads", () => {
      const payload: CreateCommentPayload = {
        postId: "post-defaults-ignored",
        userId: "user-defaults-1",
        text: "Minimal comment",
        createdAt: new Date("2026-07-04T13:00:00.000Z"),
        updatedAt: new Date("2026-07-04T13:05:00.000Z"),
        isNSFW: undefined as unknown as boolean,
        isPending: undefined,
        isEdited: false,
        commentsCount: undefined as unknown as number,
        likesCount: undefined as unknown as number,
      };

      expect(toCreateCommentTxArgs("post-defaults-1", payload)).toMatchObject({
        p_likes_count: 0,
        p_comments_count: 0,
        p_is_nsfw: false,
        p_is_pending: false,
        p_moderation_context: null,
        p_image_url: null,
        p_image_meta: null,
        p_device: null,
      });
    });
  });

  describe("toUpdateRow", () => {
    it("omits undefined update fields", () => {
      const row = toUpdateRow({
        text: undefined,
        isNSFW: undefined,
        isPending: undefined,
        moderationStatus: undefined,
        moderationContext: undefined,
        isEdited: undefined,
        imageMeta: undefined,
        updatedAt: undefined,
      } as UpdateCommentPayload);

      expect(row).toEqual({});
      expect(Object.keys(row)).toEqual([]);
      expect(row).not.toHaveProperty("text");
      expect(row).not.toHaveProperty("is_nsfw");
      expect(row).not.toHaveProperty("is_pending");
      expect(row).not.toHaveProperty("status");
      expect(row).not.toHaveProperty("moderation_context");
      expect(row).not.toHaveProperty("is_edited");
      expect(row).not.toHaveProperty("image_meta");
      expect(row).not.toHaveProperty("updated_at");
    });

    it("maps update fields and preserves explicit null clearing values", () => {
      const row = toUpdateRow({
        text: "Edited comment",
        isNSFW: false,
        isPending: true,
        moderationStatus: "pending",
        moderationContext: null,
        isEdited: true,
        imageMeta: null,
        updatedAt: new Date("2026-07-05T14:15:16.000Z"),
      });

      expect(row).toEqual({
        text: "Edited comment",
        is_nsfw: false,
        is_pending: true,
        status: "pending",
        moderation_context: null,
        is_edited: true,
        image_meta: null,
        updated_at: "2026-07-05T14:15:16.000Z",
      });
    });
  });
});
