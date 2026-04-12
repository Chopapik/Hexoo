import { createAppError } from "@/lib/AppError";
import { deleteImage } from "@/features/images/api/image.service";
import { parseImageMeta } from "@/features/images/utils/imageMeta";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { ModerationCommentResponseDto as ModerationCommentResponse } from "@/features/comments/types/comment.dto";
import { ModerationPostResponseDto as ModerationPostResponse } from "@/features/posts/types/post.dto";
import { UserRole } from "@/features/users/types/user.type";
import type { BlockUserRequestDto as BlockUserRequest } from "@/features/users/types/user.dto";
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

  private async runRpc(name: string, payload: Record<string, unknown>) {
    const { error } = await supabaseAdmin.rpc(name, payload);
    if (error) {
      throw createAppError({
        code: "DB_ERROR",
        message: `[moderatorService.${name}] Transaction failed`,
        details: error,
      });
    }
  }

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

  async blockUser(data: BlockUserRequest): Promise<void> {
    this.ensureModeratorOrAdmin();

    if (!data.uidToBlock) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[moderatorService.blockUser] No 'uidToBlock' provided",
      });
    }

    await this.runRpc("moderator_block_user_tx", {
      p_uid_to_block: data.uidToBlock,
      p_banned_by: data.bannedBy,
      p_banned_reason: data.bannedReason,
    });

    try {
      await this.authRepository?.updateUser(data.uidToBlock, {
        disabled: true,
      });
    } catch {
      // Auth provider may not support disabled; ignore
    }
  }

  async unblockUser(uid: string): Promise<void> {
    const session = this.ensureModeratorOrAdmin();

    if (!uid) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[moderatorService.unblockUser] No 'uid' provided",
      });
    }

    await this.runRpc("moderator_unblock_user_tx", {
      p_uid: uid,
      p_moderator_uid: session.uid,
    });

    try {
      await this.authRepository?.updateUser(uid, { disabled: false });
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

    const { data: txResult, error } = await supabaseAdmin.rpc(
      "moderator_review_post_tx",
      {
        p_post_id: postId,
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
      try {
        await deleteImage(meta);
      } catch {
        // DB transaction is already committed; image cleanup is best-effort.
      }
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

    const { data: txResult, error } = await supabaseAdmin.rpc(
      "moderator_review_comment_tx",
      {
        p_comment_id: commentId,
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
      try {
        await deleteImage(meta);
      } catch {
        // DB transaction is already committed; image cleanup is best-effort.
      }
    }
  }
}
