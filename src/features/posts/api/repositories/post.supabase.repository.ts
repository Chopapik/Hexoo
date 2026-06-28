import { supabaseAdmin } from "@/lib/supabaseServer";
import { applyCursorPagination, throwDbError } from "@/lib/supabaseRepository";
import { ReportDetails } from "@/features/shared/types/report.type";
import type { PostRepository } from "./post.repository.interface";
import type {
  CreatePostPayload,
  UpdatePostPayload,
} from "../../types/post.payload";
import type { PostEntity } from "../../types/post.entity";
import type { PostReportInsertRow } from "../../types/post.row";
import { mapPostRow, toInsertRow, toUpdateRow } from "./post.supabase.mapper";
import { createAppError } from "@/lib/AppError";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { toModerationContext } from "@/features/moderation/api/repositories/moderationLog.supabase.mapper";

const POST_REPORTS_TABLE = "post_reports";

const TABLE = "posts";

export class PostSupabaseRepository implements PostRepository {
  async createPost(data: CreatePostPayload): Promise<string> {
    const row = toInsertRow(data);
    const { data: inserted, error } = await supabaseAdmin
      .from(TABLE)
      .insert(row)
      .select("id")
      .single();
    throwDbError(error);
    return inserted.id;
  }

  async updatePost(
    postId: string,
    data: UpdatePostPayload,
  ): Promise<PostEntity> {
    const row = toUpdateRow(data);
    const { data: updated, error } = await supabaseAdmin
      .from(TABLE)
      .update(row)
      .eq("id", postId)
      .select("*")
      .maybeSingle();
    throwDbError(error);
    if (!updated) {
      throw createAppError({ code: "NOT_FOUND", message: "Post not found" });
    }
    return mapPostRow(updated);
  }

  async deletePost(postId: string): Promise<void> {
    const { data: deleted, error } = await supabaseAdmin
      .from(TABLE)
      .delete()
      .eq("id", postId)
      .select("id")
      .maybeSingle();
    throwDbError(error);
    if (!deleted) {
      throw createAppError({ code: "NOT_FOUND", message: "Post not found" });
    }
  }

  async getPostById(postId: string): Promise<PostEntity | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("id", postId)
      .maybeSingle();
    throwDbError(error);
    if (!data) return null;
    return mapPostRow(data);
  }

  async getPostsByIds(postIds: string[]): Promise<PostEntity[]> {
    if (postIds.length === 0) return [];
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .in("id", postIds);
    throwDbError(error);
    return (data ?? []).map(mapPostRow);
  }

  async getPosts(limit: number, startAfterId?: string): Promise<PostEntity[]> {
    const query = supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("status", "visible")
      .order("created_at", { ascending: false })
      .limit(limit);

    await applyCursorPagination(query, TABLE, startAfterId);

    const { data, error } = await query;
    throwDbError(error);
    return (data ?? []).map(mapPostRow);
  }

  async getPostsByUserId(
    userId: string,
    limit: number,
    startAfterId?: string,
  ): Promise<PostEntity[]> {
    const query = supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .eq("status", "visible")
      .order("created_at", { ascending: false })
      .limit(limit);

    await applyCursorPagination(query, TABLE, startAfterId);

    const { data, error } = await query;
    throwDbError(error);
    return (data ?? []).map(mapPostRow);
  }

  async reportPost(
    postId: string,
    reportDetails: ReportDetails,
  ): Promise<{ hidden: boolean; reportsCount: number }> {
    const post = await this.getPostById(postId);
    if (!post) return { hidden: false, reportsCount: 0 };

    const reportRow: PostReportInsertRow = {
      post_id: postId,
      user_id: reportDetails.uid,
      reason: reportDetails.reason,
      details: reportDetails.details ?? null,
      created_at:
        reportDetails.createdAt instanceof Date
          ? reportDetails.createdAt.toISOString()
          : new Date().toISOString(),
    };

    const { error: insertError } = await supabaseAdmin
      .from(POST_REPORTS_TABLE)
      .upsert(reportRow, {
        onConflict: "post_id,user_id",
        ignoreDuplicates: true,
      });

    throwDbError(insertError);

    const { count, error: countError } = await supabaseAdmin
      .from(POST_REPORTS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    throwDbError(countError);
    const reportsCount = count ?? 0;
    const shouldHide = reportsCount >= 3;

    if (shouldHide) {
      await this.updatePost(postId, {
        isPending: true,
        moderationStatus: "pending",
        moderationContext: toModerationContext({
          userId: post.userId,
          timestamp: new Date(),
          verdict: ModerationStatus.Pending,
          categories: [reportDetails.reason],
          actionTaken: "FLAGGED_FOR_REVIEW",
          source: "user_report",
          actorId: reportDetails.uid,
          reasonSummary: "Post hidden after multiple user reports",
          reasonDetails: reportDetails.details ?? undefined,
        }),
      });
    }

    return { hidden: shouldHide, reportsCount };
  }

  async hasUserReportedPost(postId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from(POST_REPORTS_TABLE)
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    throwDbError(error);
    return !!data;
  }

  async getPostsPendingModeration(
    limit: number,
    startAfterId?: string,
  ): Promise<PostEntity[]> {
    const query = supabaseAdmin
      .from(TABLE)
      .select("*")
      .in("status", ["pending", "quarantined"])
      .order("created_at", { ascending: false })
      .limit(limit);

    await applyCursorPagination(query, TABLE, startAfterId);

    const { data, error } = await query;
    throwDbError(error);
    return (data ?? []).map(mapPostRow);
  }
}
