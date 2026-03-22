import { createAppError } from "@/lib/AppError";
import { postRepository } from "@/features/posts/api/repositories";
import { deleteImage } from "@/features/images/api/image.service";
import { logActivity } from "@/features/activity/api/services";
import { ModerationPostResponseDto as ModerationPostResponse } from "@/features/posts/types/post.dto";
import { UserRole } from "@/features/users/types/user.type";
import type { BlockUserRequestDto as BlockUserRequest } from "@/features/users/types/user.dto";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { logModerationEvent } from "@/features/moderation/api/services/moderationLog.service";
import type { ModerationService as IModerationService } from "@/features/moderation/api/services/moderation.service.interface";
import type { SessionData } from "@/features/me/me.type";
import type { ModeratorService as IModeratorService } from "./moderator.service.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";

export class ModeratorService implements IModeratorService {
  constructor(
    private readonly session: SessionData | null,
    private readonly moderationService: IModerationService,
    private readonly userRepository: UserRepository,
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

  private async handleRejectAction(
    postId: string,
    post: NonNullable<Awaited<ReturnType<typeof postRepository.getPostById>>>,
    moderatorUid: string,
    categories: string[],
    justification: string,
    now: Date,
  ) {
    if (post?.imageMeta?.storagePath) {
      await deleteImage(post.imageMeta.storagePath);
    }
    await postRepository.deletePost(postId);
    await logModerationEvent({
      userId: post.userId,
      timestamp: now,
      verdict: ModerationStatus.Rejected,
      categories,
      actionTaken: "CONTENT_REMOVED",
      resourceType: "post",
      resourceId: postId,
      source: "moderator",
      actorId: moderatorUid,
      reasonSummary: "Post removed by moderator",
      reasonDetails: justification,
    });
    if (post.userId) {
      await logActivity(
        post.userId,
        "POST_REJECTED",
        `Post ${postId} rejected by moderator`,
      );
    }
  }

  private async handleApproveAction(
    postId: string,
    post: NonNullable<Awaited<ReturnType<typeof postRepository.getPostById>>>,
    moderatorUid: string,
    categories: string[],
    justification: string,
    now: Date,
  ) {
    await postRepository.updatePost(postId, {
      isPending: false,
    });
    await logModerationEvent({
      userId: post.userId,
      timestamp: now,
      verdict: ModerationStatus.Approved,
      categories,
      actionTaken: "FLAGGED_FOR_REVIEW",
      resourceType: "post",
      resourceId: postId,
      source: "moderator",
      actorId: moderatorUid,
      reasonSummary: "Post approved by moderator",
      reasonDetails: justification,
    });
    if (post.userId) {
      await logActivity(
        post.userId,
        "POST_APPROVED",
        `Post ${postId} approved by moderator`,
      );
    }
  }

  private async handleQuarantineAction(
    postId: string,
    post: NonNullable<Awaited<ReturnType<typeof postRepository.getPostById>>>,
    moderatorUid: string,
    categories: string[],
    justification: string,
    now: Date,
  ) {
    await postRepository.updatePost(postId, {
      isPending: true,
    });
    await logModerationEvent({
      userId: post.userId,
      timestamp: now,
      verdict: ModerationStatus.Pending,
      categories,
      actionTaken: "FLAGGED_FOR_REVIEW",
      resourceType: "post",
      resourceId: postId,
      source: "moderator",
      actorId: moderatorUid,
      reasonSummary: "Post moved to quarantine by moderator",
      reasonDetails: justification,
    });
    if (post.userId) {
      await logActivity(
        post.userId,
        "POST_QUARANTINED",
        `Post ${postId} moved to quarantine by moderator`,
      );
    }
  }

  async getModerationQueue(
    limit: number = 20,
    startAfterId?: string,
  ): Promise<ModerationPostResponse[]> {
    const session = this.ensureModeratorOrAdmin();

    if (!startAfterId) {
      await logActivity(
        session.uid,
        "MODERATOR_VIEWED_QUEUE",
        "Viewed moderation queue",
      );
    }

    // For now we only support posts in the moderation queue.
    return this.moderationService.getModerationQueue(
      "post",
      limit,
      startAfterId,
    );
  }

  async blockUser(data: BlockUserRequest): Promise<void> {
    const session = this.ensureModeratorOrAdmin();

    if (!data.uidToBlock) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[moderatorService.blockUser] No 'uidToBlock' provided",
      });
    }

    await this.userRepository.blockUser(data);
    try {
      await this.authRepository?.updateUser(data.uidToBlock, { disabled: true });
    } catch {
      // Auth provider may not support disabled; ignore
    }

    await logActivity(
      data.uidToBlock,
      "USER_BLOCKED",
      `Blocked by ${data.bannedBy}. Reason: ${data.bannedReason}`,
    );
    await logActivity(
      session.uid,
      "MODERATOR_BLOCKED_USER",
      `Blocked user ${data.uidToBlock}`,
    );
  }

  async unblockUser(uid: string): Promise<void> {
    const session = this.ensureModeratorOrAdmin();

    if (!uid) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[moderatorService.unblockUser] No 'uid' provided",
      });
    }

    await this.userRepository.unblockUser(uid);
    try {
      await this.authRepository?.updateUser(uid, { disabled: false });
    } catch {
      // Auth provider may not support disabled; ignore
    }

    await logActivity(uid, "USER_UNBLOCKED", "User account unblocked");
    await logActivity(
      session.uid,
      "MODERATOR_UNBLOCKED_USER",
      `Unblocked user ${uid}`,
    );
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

    const post = await postRepository.getPostById(postId);
    if (!post) {
      throw createAppError({
        code: "NOT_FOUND",
        message: "[moderatorService.reviewPost] Post not found",
      });
    }

    if (action !== "approve" && !justification?.trim()) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[moderatorService.reviewPost] justification is required",
      });
    }

    const now = new Date();

    await logActivity(
      moderator.uid,
      "MODERATOR_REVIEWED_POST",
      `Reviewed post ${postId} with action ${action}`,
    );

    if (action === "reject") {
      await this.handleRejectAction(
        postId,
        post,
        moderator.uid,
        categories,
        justification,
        now,
      );
    } else if (action === "approve") {
      await this.handleApproveAction(
        postId,
        post,
        moderator.uid,
        categories,
        justification,
        now,
      );
    } else if (action === "quarantine") {
      await this.handleQuarantineAction(
        postId,
        post,
        moderator.uid,
        categories,
        justification,
        now,
      );
    }

    if (banAuthor && post.userId) {
      try {
        await this.blockUser({
          uidToBlock: post.userId,
          bannedBy: moderator.uid,
          bannedReason: `Decision on post ${postId}`,
        });
      } catch (error) {
        throw createAppError({
          code: "INTERNAL_ERROR",
          message: `[ReviewPost] Failed to block user ${post.userId} after post review`,
          details: error,
        });
      }
    }
  }
}
