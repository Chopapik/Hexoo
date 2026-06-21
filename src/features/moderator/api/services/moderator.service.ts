import { createAppError } from "@/lib/AppError";
import { deleteImage } from "@/features/images/api/image.service";
import {
  deleteImages,
  deleteImageWithRetry,
} from "@/features/images/api/image-cleanup";
import type { ImageMeta } from "@/features/images/types/image.type";
import { parseImageMeta } from "@/features/images/utils/imageMeta";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { ModerationCommentResponseDto as ModerationCommentResponse } from "@/features/comments/types/comment.dto";
import { ModerationPostResponseDto as ModerationPostResponse } from "@/features/posts/types/post.dto";
import { UserRole } from "@/features/users/types/user.type";
import { userRepository } from "@/features/users/api/repositories";
import type { ModeratorBanUserRequestDto as ModeratorBanUserRequest } from "@/features/moderator/types/moderator.dto";
import type { ModerationService as IModerationService } from "@/features/moderation/api/services/moderation.service.interface";
import type { SessionData } from "@/features/me/me.type";
import type { ModeratorService as IModeratorService } from "./moderator.service.interface";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";

export class ModeratorService implements IModeratorService {
  constructor(
    private readonly session: SessionData | null,
    private readonly moderationService: IModerationService,
    private readonly authRepository: AuthRepository | null,
  ) {}

  private ensureModeratorOrAdmin(): SessionData {
    const session = this.session;
    if (!session) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message: "[moderatorService.ensureModeratorOrAdmin] No session found",
      });
    }
    if (
      session.role !== UserRole.Moderator &&
      session.role !== UserRole.Admin
    ) {
      throw createAppError({
        code: "FORBIDDEN",
        message:
          "[moderatorService.ensureModeratorOrAdmin] Missing moderator/admin role",
      });
    }
    return session;
  }

  private ensureModerator(): SessionData {
    const session = this.session;
    if (!session) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message: "[moderatorService.ensureModerator] No session found",
      });
    }

    if (session.role !== UserRole.Moderator) {
      throw createAppError({
        code: "FORBIDDEN",
        message: "[moderatorService.ensureModerator] Moderator role required",
      });
    }

    return session;
  }

  private async blockUserWithAuditLog(data: {
    uidToBlock: string;
    bannedBy: string;
    bannedReason: string;
  }) {
    const { error } = await supabaseAdmin.rpc("moderator_block_user_tx", {
      p_uid_to_block: data.uidToBlock,
      p_banned_by: data.bannedBy,
      p_banned_reason: data.bannedReason,
    });

    if (error) {
      throw createAppError({
        code: "DB_ERROR",
        message: "[moderatorService.blockUser] Transaction failed",
        details: error,
      });
    }
  }

  private async isReviewNoOp(
    table: "posts" | "comments",
    resourceId: string,
    action: "approve" | "reject" | "quarantine",
  ): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("status")
      .eq("id", resourceId)
      .maybeSingle();

    if (error) {
      throw createAppError({
        code: "DB_ERROR",
        message: "[moderatorService.isReviewNoOp] Failed to read content state",
        details: error,
      });
    }

    if (!data) return action === "reject";
    if (action === "approve") return data.status === "visible";
    if (action === "quarantine") return data.status === "quarantined";
    return false;
  }

  private async collectPostCommentImages(postId: string): Promise<ImageMeta[]> {
    const { data, error } = await supabaseAdmin
      .from("comments")
      .select("image_meta")
      .eq("post_id", postId);
    if (error) {
      throw createAppError({
        code: "DB_ERROR",
        message:
          "[moderatorService.reviewPost] Failed to collect comment image cleanup inventory",
        details: error,
      });
    }
    return (data ?? [])
      .map((row) => parseImageMeta(row.image_meta))
      .filter((meta) => meta !== null);
  }

  async getModerationQueueForPosts(
    limit: number = 20,
    startAfterId?: string,
  ): Promise<ModerationPostResponse[]> {
    const session = this.ensureModeratorOrAdmin();

    if (!startAfterId) {
      const { error } = await supabaseAdmin.from("activity_logs").insert({
        user_id: session.uid,
        action: "MODERATOR_VIEWED_QUEUE",
        details: "Viewed moderation queue (posts)",
      });
      if (error) {
        throw createAppError({
          code: "DB_ERROR",
          message:
            "[moderatorService.getModerationQueueForPosts] Failed to log activity",
          details: error,
        });
      }
    }

    return this.moderationService.getModerationQueueForPosts(
      limit,
      startAfterId,
    );
  }

  async getModerationQueueForComments(
    limit: number = 20,
    startAfterId?: string,
  ): Promise<ModerationCommentResponse[]> {
    const session = this.ensureModeratorOrAdmin();

    if (!startAfterId) {
      const { error } = await supabaseAdmin.from("activity_logs").insert({
        user_id: session.uid,
        action: "MODERATOR_VIEWED_QUEUE",
        details: "Viewed moderation queue (comments)",
      });
      if (error) {
        throw createAppError({
          code: "DB_ERROR",
          message:
            "[moderatorService.getModerationQueueForComments] Failed to log activity",
          details: error,
        });
      }
    }

    return this.moderationService.getModerationQueueForComments(
      limit,
      startAfterId,
    );
  }

  async blockUser(data: ModeratorBanUserRequest): Promise<void> {
    const moderator = this.ensureModerator();

    if (!data.uidToBlock) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[moderatorService.blockUser] No 'uidToBlock' provided",
      });
    }

    if (!data.reason?.trim()) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[moderatorService.blockUser] Ban reason is required",
      });
    }

    if (
      !data.moderationCaseId &&
      !data.reportId &&
      !data.postId &&
      !data.commentId
    ) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message:
          "[moderatorService.blockUser] Moderation case or resource link is required",
      });
    }

    if (data.uidToBlock === moderator.uid) {
      throw createAppError({
        code: "FORBIDDEN",
        message: "[moderatorService.blockUser] Moderator cannot ban self",
      });
    }

    const target = await userRepository.getUserByUid(data.uidToBlock);
    if (!target) {
      throw createAppError({
        code: "NOT_FOUND",
        message: "[moderatorService.blockUser] Target user not found",
      });
    }

    if (target.role !== UserRole.User) {
      throw createAppError({
        code: "FORBIDDEN",
        message:
          "[moderatorService.blockUser] Moderator can ban only ordinary users",
      });
    }

    await this.blockUserWithAuditLog({
      uidToBlock: data.uidToBlock,
      bannedBy: moderator.uid,
      bannedReason: data.reason.trim(),
    });

    try {
      await this.authRepository?.updateUser(data.uidToBlock, {
        disabled: true,
      });
    } catch {
      // Auth provider may not support disabled; ignore
    }
  }

  async reviewPost(
    postId: string,
    action: "approve" | "reject" | "quarantine",
    banAuthor: boolean = false,
    categories: string[],
    justification: string,
  ) {
    const moderator = this.ensureModeratorOrAdmin();

    if (!postId) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[moderatorService.reviewPost] postId was empty",
      });
    }

    if (action !== "approve" && !justification?.trim()) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[moderatorService.reviewPost] justification is required",
      });
    }

    if (await this.isReviewNoOp("posts", postId, action)) return;

    const commentImages =
      action === "reject"
        ? await this.collectPostCommentImages(postId)
        : [];

    const { data: txResult, error } = await supabaseAdmin.rpc(
      "moderator_review_content_guarded_tx",
      {
        p_resource_type: "post",
        p_resource_id: postId,
        p_action: action,
        p_moderator_uid: moderator.uid,
        p_categories: categories,
        p_justification: justification,
        p_ban_author: banAuthor,
      },
    );

    if (error) {
      throw createAppError({
        code: "DB_ERROR",
        message: "[moderatorService.reviewPost] Transaction failed",
        details: error,
      });
    }

    const result = (txResult ?? {}) as {
      deletedImageMeta?: unknown;
      authorUid?: string | null;
    };

    if (banAuthor && result.authorUid) {
      try {
        await this.authRepository?.updateUser(result.authorUid, {
          disabled: true,
        });
      } catch {
        // Auth provider may not support disabled; ignore
      }
    }

    if (action === "reject" && result.deletedImageMeta != null) {
      const meta = parseImageMeta(result.deletedImageMeta);
      await deleteImages([meta, ...commentImages], deleteImage);
    } else if (action === "reject") {
      await deleteImages(commentImages, deleteImage);
    }
  }

  async reviewComment(
    commentId: string,
    action: "approve" | "reject" | "quarantine",
    banAuthor: boolean = false,
    categories: string[],
    justification: string,
  ) {
    const moderator = this.ensureModeratorOrAdmin();

    if (!commentId) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[moderatorService.reviewComment] commentId was empty",
      });
    }

    if (action !== "approve" && !justification?.trim()) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[moderatorService.reviewComment] justification is required",
      });
    }

    if (await this.isReviewNoOp("comments", commentId, action)) return;

    const { data: txResult, error } = await supabaseAdmin.rpc(
      "moderator_review_content_guarded_tx",
      {
        p_resource_type: "comment",
        p_resource_id: commentId,
        p_action: action,
        p_moderator_uid: moderator.uid,
        p_categories: categories,
        p_justification: justification,
        p_ban_author: banAuthor,
      },
    );

    if (error) {
      throw createAppError({
        code: "DB_ERROR",
        message: "[moderatorService.reviewComment] Transaction failed",
        details: error,
      });
    }

    const result = (txResult ?? {}) as {
      deletedImageMeta?: unknown;
      authorUid?: string | null;
    };

    if (banAuthor && result.authorUid) {
      try {
        await this.authRepository?.updateUser(result.authorUid, {
          disabled: true,
        });
      } catch {
        // Auth provider may not support disabled; ignore
      }
    }

    if (action === "reject" && result.deletedImageMeta != null) {
      const meta = parseImageMeta(result.deletedImageMeta);
      await deleteImageWithRetry(meta, deleteImage);
    }
  }
}
