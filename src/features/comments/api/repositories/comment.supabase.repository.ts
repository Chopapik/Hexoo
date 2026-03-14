import { supabaseAdmin } from "@/lib/supabaseServer";
import type { CommentRepository } from "./comment.repository.interface";
import type { CreateCommentPayload } from "../../types/comment.payload";
import type { CommentEntity } from "../../types/comment.entity";
import type { CommentRow } from "../../types/comment.row";

const COMMENTS_TABLE = "comments";
const POSTS_TABLE = "posts";

function parseDate(s: string | null | undefined): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
}

function rowToEntity(row: CommentRow): CommentEntity {
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
    imageUrl: row.image_url ?? undefined,
    imageMeta: row.image_meta ?? undefined,
    device: row.device ?? undefined,
    userReports: undefined,
    reportsMeta: undefined,
  };
}

function createPayloadToRow(
  postId: string,
  data: CreateCommentPayload,
): Record<string, unknown> {
  const row: Record<string, unknown> = {
    post_id: postId,
    user_id: data.userId,
    text: data.text ?? "",
    likes_count: data.likesCount ?? 0,
    comments_count: data.commentsCount ?? 0,
    is_nsfw: data.isNSFW ?? false,
    is_pending: data.isPending ?? false,
  };
  row.created_at =
    data.createdAt instanceof Date
      ? data.createdAt.toISOString()
      : new Date().toISOString();
  if (data.updatedAt != null)
    row.updated_at =
      data.updatedAt instanceof Date
        ? data.updatedAt.toISOString()
        : new Date().toISOString();
  if (data.imageUrl !== undefined) row.image_url = data.imageUrl;
  if (data.imageMeta !== undefined) row.image_meta = data.imageMeta;
  if (data.device !== undefined) row.device = data.device;
  return row;
}

export class CommentSupabaseRepository implements CommentRepository {
  async createComment(
    postId: string,
    data: CreateCommentPayload,
  ): Promise<void> {
    const row = createPayloadToRow(postId, data);
    const { error: insertError } = await supabaseAdmin
      .from(COMMENTS_TABLE)
      .insert(row);
    if (insertError) throw new Error(insertError.message ?? "Database error");

    const { data: postRow } = await supabaseAdmin
      .from(POSTS_TABLE)
      .select("comments_count")
      .eq("id", postId)
      .single();
    const cur =
      (postRow as { comments_count: number } | null)?.comments_count ?? 0;
    const { error: updateError } = await supabaseAdmin
      .from(POSTS_TABLE)
      .update({
        comments_count: cur + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);
    if (updateError) throw new Error(updateError.message ?? "Database error");
  }

  async getCommentsByPostId(postId: string): Promise<CommentEntity[]> {
    const { data, error } = await supabaseAdmin
      .from(COMMENTS_TABLE)
      .select("*")
      .eq("post_id", postId)
      .eq("is_pending", false)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message ?? "Database error");
    return (data ?? []).map((row) => rowToEntity(row as CommentRow));
  }
}
