import { supabaseAdmin } from "@/lib/supabaseServer";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { ReportDetails } from "@/features/shared/types/report.type";
import { logModerationEvent } from "@/features/moderation/api/services/moderationLog.service";
import type { CommentRepository } from "./comment.repository.interface";
import type {
  CreateCommentPayload,
  UpdateCommentPayload,
} from "../../types/comment.payload";
import type { CommentEntity } from "../../types/comment.entity";
import type { CommentRow } from "../../types/comment.row";
import { parseDate } from "@/features/shared/utils/dateUtils";
const COMMENTS_TABLE = "comments";
const COMMENT_REPORTS_TABLE = "comment_reports";

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
    isEdited: row.is_edited,
    imageMeta: row.image_meta ?? undefined,
    device: row.device ?? undefined,
    userReports: undefined,
    reportsMeta: undefined,
  };
}

function updatePayloadToRow(
  data: UpdateCommentPayload,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.text != null) row.text = data.text;
  if (data.isNSFW != null) row.is_nsfw = data.isNSFW;
  if (data.isPending != null) row.is_pending = data.isPending;
  if (data.isEdited != null) row.is_edited = data.isEdited;
  if (data.imageMeta !== undefined) row.image_meta = data.imageMeta;
  if (data.updatedAt != null)
    row.updated_at =
      data.updatedAt instanceof Date
        ? data.updatedAt.toISOString()
        : data.updatedAt;
  return row;
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
      p_image_url: null,
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

  async getCommentsPendingModeration(
    limit: number,
    startAfterId?: string,
  ): Promise<CommentEntity[]> {
    let query = supabaseAdmin
      .from(COMMENTS_TABLE)
      .select("*")
      .eq("is_pending", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (startAfterId) {
      const cursorRow = await supabaseAdmin
        .from(COMMENTS_TABLE)
        .select("created_at, id")
        .eq("id", startAfterId)
        .maybeSingle();
      if (cursorRow.data) {
        const { created_at, id } = cursorRow.data as {
          created_at: string;
          id: string;
        };
        query = query.or(
          `created_at.lt.${created_at},and(created_at.eq.${created_at},id.lt.${id})`,
        );
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message ?? "Database error");
    return (data ?? []).map((row) => rowToEntity(row as CommentRow));
  }

  async getCommentById(commentId: string): Promise<CommentEntity | null> {
    const { data, error } = await supabaseAdmin
      .from(COMMENTS_TABLE)
      .select("*")
      .eq("id", commentId)
      .maybeSingle();
    if (error) throw new Error(error.message ?? "Database error");
    if (!data) return null;
    return rowToEntity(data as CommentRow);
  }

  async updateComment(
    commentId: string,
    data: UpdateCommentPayload,
  ): Promise<void> {
    const row = updatePayloadToRow(data);
    const { error } = await supabaseAdmin
      .from(COMMENTS_TABLE)
      .update(row)
      .eq("id", commentId);
    if (error) throw new Error(error.message ?? "Database error");
  }

  async deleteComment(commentId: string, postId: string): Promise<void> {
    const { error } = await supabaseAdmin.rpc("delete_comment_tx", {
      p_comment_id: commentId,
      p_post_id: postId,
    });
    if (error) throw new Error(error.message ?? "Database error");
  }

  async reportComment(
    commentId: string,
    reportDetails: ReportDetails,
  ): Promise<{ hidden: boolean; reportsCount: number }> {
    const comment = await this.getCommentById(commentId);
    if (!comment) return { hidden: false, reportsCount: 0 };

    const { error: insertError } = await supabaseAdmin
      .from(COMMENT_REPORTS_TABLE)
      .upsert(
        {
          comment_id: commentId,
          user_id: reportDetails.uid,
          reason: reportDetails.reason,
          details: reportDetails.details ?? null,
          created_at:
            reportDetails.createdAt instanceof Date
              ? reportDetails.createdAt.toISOString()
              : new Date().toISOString(),
        },
        {
          onConflict: "comment_id,user_id",
          ignoreDuplicates: true,
        },
      );

    if (insertError) throw new Error(insertError.message ?? "Database error");

    const { count, error: countError } = await supabaseAdmin
      .from(COMMENT_REPORTS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("comment_id", commentId);

    if (countError) throw new Error(countError.message ?? "Database error");
    const reportsCount = count ?? 0;
    const shouldHide = reportsCount >= 3;

    if (shouldHide) {
      await this.updateComment(commentId, {
        isPending: true,
      });

      await logModerationEvent({
        userId: comment.userId,
        timestamp: new Date(),
        verdict: ModerationStatus.Pending,
        categories: [reportDetails.reason],
        actionTaken: "FLAGGED_FOR_REVIEW",
        resourceType: "comment",
        resourceId: commentId,
        source: "user_report",
        actorId: reportDetails.uid,
        reasonSummary: "Comment hidden after multiple user reports",
        reasonDetails: reportDetails.details ?? undefined,
      });
    }

    return { hidden: shouldHide, reportsCount };
  }
}
