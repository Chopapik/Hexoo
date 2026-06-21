import {
  imageMetaToJson,
  parseImageMeta,
} from "@/features/images/utils/imageMeta";
import { parseDate } from "@/features/shared/utils/dateUtils";
import type { Json } from "@/lib/supabase.database.types";
import type {
  CreateCommentPayload,
  UpdateCommentPayload,
} from "../../types/comment.payload";
import type { CommentEntity } from "../../types/comment.entity";
import type { CommentRow, CommentUpdateRow } from "../../types/comment.row";

export type CreateCommentTxArgs = {
  p_comments_count: number;
  p_created_at: string;
  p_device: string | null;
  p_image_meta: Json | null;
  p_image_url: string | null;
  p_is_nsfw: boolean;
  p_is_pending: boolean;
  p_moderation_context: Json | null;
  p_likes_count: number;
  p_post_id: string;
  p_text: string;
  p_updated_at: string | null;
  p_user_id: string;
};

function toDbTimestamp(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapCommentRow(row: CommentRow): CommentEntity {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    text: row.text,
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    createdAt: parseDate(row.created_at) ?? new Date(0),
    updatedAt: parseDate(row.updated_at),
    isNSFW: row.is_nsfw,
    isPending: row.is_pending,
    moderationStatus: row.status,
    isEdited: row.is_edited,
    imageMeta: parseImageMeta(row.image_meta) ?? undefined,
    device: row.device ?? undefined,
    userReports: undefined,
    reportsMeta: undefined,
  };
}

export function toCreateCommentTxArgs(
  postId: string,
  data: CreateCommentPayload,
): CreateCommentTxArgs {
  return {
    p_post_id: postId,
    p_user_id: data.userId,
    p_text: data.text ?? "",
    p_likes_count: data.likesCount ?? 0,
    p_comments_count: data.commentsCount ?? 0,
    p_created_at: toDbTimestamp(data.createdAt),
    p_updated_at: data.updatedAt ? toDbTimestamp(data.updatedAt) : null,
    p_is_nsfw: data.isNSFW ?? false,
    p_is_pending: data.isPending ?? false,
    p_moderation_context: data.moderationContext ?? null,
    p_image_url: null,
    p_image_meta: imageMetaToJson(data.imageMeta),
    p_device: data.device ?? null,
  };
}

export function toUpdateRow(data: UpdateCommentPayload): CommentUpdateRow {
  const row: CommentUpdateRow = {};

  if (data.text != null) row.text = data.text;
  if (data.isNSFW != null) row.is_nsfw = data.isNSFW;
  if (data.isPending != null) row.is_pending = data.isPending;
  if (data.moderationStatus != null) row.status = data.moderationStatus;
  if (data.moderationContext !== undefined) {
    row.moderation_context = data.moderationContext;
  }
  if (data.isEdited != null) row.is_edited = data.isEdited;
  if (data.imageMeta !== undefined) {
    row.image_meta = imageMetaToJson(data.imageMeta);
  }
  if (data.updatedAt != null) row.updated_at = toDbTimestamp(data.updatedAt);

  return row;
}
