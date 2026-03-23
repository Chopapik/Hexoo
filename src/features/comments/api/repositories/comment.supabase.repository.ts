import { supabaseAdmin } from "@/lib/supabaseServer";
import type { CommentRepository } from "./comment.repository.interface";
import type { CreateCommentPayload } from "../../types/comment.payload";
import type { CommentEntity } from "../../types/comment.entity";
import type { CommentRow } from "../../types/comment.row";
import { parseDate } from "@/features/shared/utils/dateUtils";

const COMMENTS_TABLE = "comments";

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

export class CommentSupabaseRepository implements CommentRepository {
  async createComment(
    postId: string,
    data: CreateCommentPayload,
  ): Promise<void> {
    const { error } = await supabaseAdmin.rpc("create_comment_tx", {
      p_post_id: postId,
      p_user_id: data.userId,
      p_text: data.text ?? "",
      p_likes_count: data.likesCount ?? 0,
      p_comments_count: data.commentsCount ?? 0,
      p_created_at: data.createdAt?.toISOString?.() ?? new Date().toISOString(),
      p_updated_at: data.updatedAt?.toISOString?.() ?? null,
      p_is_nsfw: data.isNSFW ?? false,
      p_is_pending: data.isPending ?? false,
      p_image_url: data.imageUrl ?? null,
      p_image_meta: data.imageMeta ?? null,
      p_device: data.device ?? null,
    });
    if (error) throw new Error(error.message ?? "Database error");
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
