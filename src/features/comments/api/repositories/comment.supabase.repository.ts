import { supabaseAdmin } from "@/lib/supabaseServer";
import {
  applyCursorPagination,
  throwDbError,
} from "@/lib/supabaseRepository";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { ReportDetails } from "@/features/shared/types/report.type";
import { logModerationEvent } from "@/features/moderation/api/services/moderationLog.service";
import type { CommentRepository } from "./comment.repository.interface";
import type {
  CreateCommentPayload,
  UpdateCommentPayload,
} from "../../types/comment.payload";
import type { CommentEntity } from "../../types/comment.entity";
import type {
  CommentReportInsertRow,
  DeleteCommentTxArgs,
} from "../../types/comment.row";
import {
  mapCommentRow,
  toCreateCommentTxArgs,
  toUpdateRow,
} from "./comment.supabase.mapper";

const COMMENTS_TABLE = "comments";
const COMMENT_REPORTS_TABLE = "comment_reports";

export class CommentSupabaseRepository implements CommentRepository {
  async createComment(
    postId: string,
    data: CreateCommentPayload,
  ): Promise<string> {
    const { data: commentId, error } = await supabaseAdmin.rpc(
      "create_comment_tx",
      toCreateCommentTxArgs(postId, data),
    );
    throwDbError(error);
    if (!commentId) {
      throw new Error("create_comment_tx returned no comment id");
    }
    return commentId;
  }

  async getCommentsByPostId(postId: string): Promise<CommentEntity[]> {
    const { data, error } = await supabaseAdmin
      .from(COMMENTS_TABLE)
      .select("*")
      .eq("post_id", postId)
      .eq("is_pending", false)
      .order("created_at", { ascending: false });
    throwDbError(error);
    return (data ?? []).map(mapCommentRow);
  }

  async getCommentsPendingModeration(
    limit: number,
    startAfterId?: string,
  ): Promise<CommentEntity[]> {
    const query = supabaseAdmin
      .from(COMMENTS_TABLE)
      .select("*")
      .eq("is_pending", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    await applyCursorPagination(query, COMMENTS_TABLE, startAfterId);

    const { data, error } = await query;
    throwDbError(error);
    return (data ?? []).map(mapCommentRow);
  }

  async getCommentById(commentId: string): Promise<CommentEntity | null> {
    const { data, error } = await supabaseAdmin
      .from(COMMENTS_TABLE)
      .select("*")
      .eq("id", commentId)
      .maybeSingle();
    throwDbError(error);
    if (!data) return null;
    return mapCommentRow(data);
  }

  async updateComment(
    commentId: string,
    data: UpdateCommentPayload,
  ): Promise<void> {
    const row = toUpdateRow(data);
    const { error } = await supabaseAdmin
      .from(COMMENTS_TABLE)
      .update(row)
      .eq("id", commentId);
    throwDbError(error);
  }

  async deleteComment(commentId: string, postId: string): Promise<void> {
    const payload: DeleteCommentTxArgs = {
      p_comment_id: commentId,
      p_post_id: postId,
    };
    const { error } = await supabaseAdmin.rpc("delete_comment_tx", payload);
    throwDbError(error);
  }

  async reportComment(
    commentId: string,
    reportDetails: ReportDetails,
  ): Promise<{ hidden: boolean; reportsCount: number }> {
    const comment = await this.getCommentById(commentId);
    if (!comment) return { hidden: false, reportsCount: 0 };

    const reportRow: CommentReportInsertRow = {
      comment_id: commentId,
      user_id: reportDetails.uid,
      reason: reportDetails.reason,
      details: reportDetails.details ?? null,
      created_at:
        reportDetails.createdAt instanceof Date
          ? reportDetails.createdAt.toISOString()
          : new Date().toISOString(),
    };

    const { error: insertError } = await supabaseAdmin
      .from(COMMENT_REPORTS_TABLE)
      .upsert(reportRow, {
        onConflict: "comment_id,user_id",
        ignoreDuplicates: true,
      });

    throwDbError(insertError);

    const { count, error: countError } = await supabaseAdmin
      .from(COMMENT_REPORTS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("comment_id", commentId);

    throwDbError(countError);
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
