import {
  imageMetaToJson,
  parseImageMeta,
} from "@/features/images/utils/imageMeta";
import { parseDate } from "@/features/shared/utils/dateUtils";
import type {
  CreatePostPayload,
  UpdatePostPayload,
} from "../../types/post.payload";
import type { PostEntity } from "../../types/post.entity";
import type {
  PostInsertRow,
  PostRow,
  PostUpdateRow,
} from "../../types/post.row";

type DbDateValue = Date | string;

function requireValue<T>(value: T | null | undefined, fieldName: string): T {
  if (value == null) {
    throw new Error(`${fieldName} is required`);
  }
  return value;
}

function toDbTimestamp(value: DbDateValue): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapPostRow(row: PostRow): PostEntity {
  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    createdAt: parseDate(row.created_at) ?? new Date(0),
    updatedAt: parseDate(row.updated_at),
    isPending: row.is_pending,
    moderationStatus: row.status,
    isNSFW: row.is_nsfw,
    isEdited: row.is_edited,
    imageMeta: parseImageMeta(row.image_meta) ?? undefined,
    imageUrl: row.image_url ?? null,
    device: row.device ?? undefined,
    youtubeUrl: row.youtube_url ?? null,
    userReports: undefined,
    reportsMeta: undefined,
  };
}

export function toInsertRow(data: CreatePostPayload): PostInsertRow {
  const row: PostInsertRow = {
    user_id: requireValue(data.userId, "userId"),
  };

  if (data.text != null) row.text = data.text;
  if (data.likesCount != null) row.likes_count = data.likesCount;
  if (data.commentsCount != null) row.comments_count = data.commentsCount;
  if (data.createdAt != null) row.created_at = toDbTimestamp(data.createdAt);
  if (data.updatedAt != null) row.updated_at = toDbTimestamp(data.updatedAt);
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
  if (data.imageUrl !== undefined) row.image_url = data.imageUrl;
  if (data.device !== undefined) row.device = data.device;
  if (data.youtubeUrl !== undefined) row.youtube_url = data.youtubeUrl || null;

  return row;
}

export function toUpdateRow(data: UpdatePostPayload): PostUpdateRow {
  const row: PostUpdateRow = {};

  if (data.text != null) row.text = data.text;
  if (data.likesCount != null) row.likes_count = data.likesCount;
  if (data.commentsCount != null) row.comments_count = data.commentsCount;
  if (data.updatedAt != null) row.updated_at = toDbTimestamp(data.updatedAt);
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
  if (data.imageUrl !== undefined) row.image_url = data.imageUrl;
  if (data.device !== undefined) row.device = data.device;
  if (data.youtubeUrl !== undefined) row.youtube_url = data.youtubeUrl || null;

  return row;
}
