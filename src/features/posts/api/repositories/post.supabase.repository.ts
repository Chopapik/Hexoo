import { supabaseAdmin } from "@/lib/supabaseServer";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { ReportDetails } from "@/features/shared/types/report.type";
import { logModerationEvent } from "@/features/moderation/api/services/moderationLog.service";
import type { PostRepository } from "./post.repository.interface";
import type {
  CreatePostPayload,
  UpdatePostPayload,
} from "../../types/post.payload";
import type { PostEntity } from "../../types/post.entity";
import type { PostRow } from "../../types/post.row";
import { parseDate } from "@/features/shared/utils/dateUtils";
const POST_REPORTS_TABLE = "post_reports";

const TABLE = "posts";

function rowToEntity(row: PostRow): PostEntity {
  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    createdAt: parseDate(row.created_at) ?? new Date(0),
    updatedAt: parseDate(row.updated_at),
    isPending: row.is_pending,
    isNSFW: row.is_nsfw,
    isEdited: row.is_edited,
    imageMeta: row.image_meta ?? undefined,
    device: row.device ?? undefined,
    userReports: undefined,
    reportsMeta: undefined,
  };
}

function createPayloadToRow(data: CreatePostPayload): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.userId != null) row.user_id = data.userId;
  if (data.text != null) row.text = data.text;
  if (data.likesCount != null) row.likes_count = data.likesCount;
  if (data.commentsCount != null) row.comments_count = data.commentsCount;
  if (data.createdAt != null)
    row.created_at =
      data.createdAt instanceof Date
        ? data.createdAt.toISOString()
        : data.createdAt;
  if (data.updatedAt != null)
    row.updated_at =
      data.updatedAt instanceof Date
        ? data.updatedAt.toISOString()
        : data.updatedAt;
  if (data.isNSFW != null) row.is_nsfw = data.isNSFW;
  if (data.isPending != null) row.is_pending = data.isPending;
  if (data.isEdited != null) row.is_edited = data.isEdited;
  if (data.imageMeta !== undefined) row.image_meta = data.imageMeta;
  if (data.device !== undefined) row.device = data.device;
  return row;
}

function updatePayloadToRow(data: UpdatePostPayload): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.text != null) row.text = data.text;
  if (data.likesCount != null) row.likes_count = data.likesCount;
  if (data.commentsCount != null) row.comments_count = data.commentsCount;
  if (data.updatedAt != null)
    row.updated_at =
      data.updatedAt instanceof Date
        ? data.updatedAt.toISOString()
        : data.updatedAt;
  if (data.isNSFW != null) row.is_nsfw = data.isNSFW;
  if (data.isPending != null) row.is_pending = data.isPending;
  if (data.isEdited != null) row.is_edited = data.isEdited;
  if (data.imageMeta !== undefined) row.image_meta = data.imageMeta;
  if (data.device !== undefined) row.device = data.device;
  return row;
}

export class PostSupabaseRepository implements PostRepository {
  async createPost(data: CreatePostPayload): Promise<string> {
    const row = createPayloadToRow(data);
    const { data: inserted, error } = await supabaseAdmin
      .from(TABLE)
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message ?? "Database error");
    return (inserted as { id: string }).id;
  }

  async updatePost(postId: string, data: UpdatePostPayload): Promise<void> {
    const row = updatePayloadToRow(data);
    const { error } = await supabaseAdmin
      .from(TABLE)
      .update(row)
      .eq("id", postId);
    if (error) throw new Error(error.message ?? "Database error");
  }

  async deletePost(postId: string): Promise<void> {
    const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", postId);
    if (error) throw new Error(error.message ?? "Database error");
  }

  async getPostById(postId: string): Promise<PostEntity | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("id", postId)
      .maybeSingle();
    if (error) throw new Error(error.message ?? "Database error");
    if (!data) return null;
    return rowToEntity(data as PostRow);
  }

  async getPostsByIds(postIds: string[]): Promise<PostEntity[]> {
    if (postIds.length === 0) return [];
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .in("id", postIds);
    if (error) throw new Error(error.message ?? "Database error");
    return (data ?? []).map((row) => rowToEntity(row as PostRow));
  }

  async getPosts(limit: number, startAfterId?: string): Promise<PostEntity[]> {
    let query = supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("is_pending", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (startAfterId) {
      const cursorRow = await supabaseAdmin
        .from(TABLE)
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
    return (data ?? []).map((row) => rowToEntity(row as PostRow));
  }

  async getPostsByUserId(
    userId: string,
    limit: number,
    startAfterId?: string,
  ): Promise<PostEntity[]> {
    let query = supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (startAfterId) {
      const cursorRow = await supabaseAdmin
        .from(TABLE)
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
    return (data ?? []).map((row) => rowToEntity(row as PostRow));
  }

  async reportPost(
    postId: string,
    reportDetails: ReportDetails,
  ): Promise<{ hidden: boolean; reportsCount: number }> {
    const post = await this.getPostById(postId);
    if (!post) return { hidden: false, reportsCount: 0 };

    const { error: insertError } = await supabaseAdmin
      .from(POST_REPORTS_TABLE)
      .upsert(
        {
          post_id: postId,
          user_id: reportDetails.uid,
          reason: reportDetails.reason,
          details: reportDetails.details ?? null,
          created_at:
            reportDetails.createdAt instanceof Date
              ? reportDetails.createdAt.toISOString()
              : new Date().toISOString(),
        },
        {
          onConflict: "post_id,user_id",
          ignoreDuplicates: true,
        },
      );

    if (insertError) throw new Error(insertError.message ?? "Database error");

    const { count, error: countError } = await supabaseAdmin
      .from(POST_REPORTS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (countError) throw new Error(countError.message ?? "Database error");
    const reportsCount = count ?? 0;
    const shouldHide = reportsCount >= 3;

    if (shouldHide) {
      await this.updatePost(postId, {
        isPending: true,
      });

      // Log threshold-based moderation triggered by user reports
      await logModerationEvent({
        userId: post.userId,
        timestamp: new Date(),
        verdict: ModerationStatus.Pending,
        categories: [reportDetails.reason],
        actionTaken: "FLAGGED_FOR_REVIEW",
        resourceType: "post",
        resourceId: postId,
        source: "user_report",
        actorId: reportDetails.uid,
        reasonSummary: "Post hidden after multiple user reports",
        reasonDetails: reportDetails.details ?? undefined,
      });
    }

    return { hidden: shouldHide, reportsCount };
  }

  async getPostsPendingModeration(
    limit: number,
    startAfterId?: string,
  ): Promise<PostEntity[]> {
    let query = supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("is_pending", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (startAfterId) {
      const cursorRow = await supabaseAdmin
        .from(TABLE)
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
    return (data ?? []).map((row) => rowToEntity(row as PostRow));
  }
}
