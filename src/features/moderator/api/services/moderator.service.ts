import { createAppError } from "@/lib/AppError";
import { postRepository } from "@/features/posts/api/repositories";
import { blockUser } from "@/features/users/api/services";
import { deleteImage } from "@/features/images/api/image.service";
import { ModerationPostDto } from "@/features/posts/types/post.dto";
import { UserRole } from "@/features/users/types/user.type";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { logModerationEvent } from "@/features/moderation/api/services/moderationLog.service";
import type { ModerationService as IModerationService } from "@/features/moderation/api/services/moderation.service.interface";
import type { SessionData } from "@/features/me/me.type";
import type { ModeratorService as IModeratorService } from "./moderator.service.interface";

export class ModeratorService implements IModeratorService {
  constructor(
    private readonly session: SessionData | null,
    private readonly moderationService: IModerationService,
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

  async getModerationQueue(): Promise<ModerationPostDto[]> {
    this.ensureModeratorOrAdmin();

    return this.moderationService.getModerationQueue(50);
  }

  async banUser(uid: string, reason: string): Promise<void> {
    const moderator = this.ensureModeratorOrAdmin();

    if (!uid) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[moderatorService.banUser] uid was empty",
      });
    }

    if (!reason?.trim()) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[moderatorService.banUser] bannedReason is required",
      });
    }

    await blockUser(moderator, {
      uidToBlock: uid,
      bannedBy: moderator.uid,
      bannedReason: reason,
    });
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

    if (action === "reject") {
      if (post.imageMeta?.storagePath) {
        await deleteImage(post.imageMeta.storagePath);
      }
      await postRepository.deletePost(postId);
      await logModerationEvent({
        userId: post.userId,
        timestamp: now,
        verdict: ModerationStatus.Rejected,
        categories: categories,
        actionTaken: "CONTENT_REMOVED",
        resourceType: "post",
        resourceId: postId,
        source: "moderator",
        actorId: moderator.uid,
        reasonSummary: "Post removed by moderator",
        reasonDetails: justification,
      });
    } else if (action === "approve") {
      await postRepository.updatePost(postId, {
        moderationStatus: ModerationStatus.Approved,
        flaggedReasons: [],
        reviewedBy: moderator.uid,
        reviewedAt: now,
      });
      await logModerationEvent({
        userId: post.userId,
        timestamp: now,
        verdict: ModerationStatus.Approved,
        categories: categories,
        actionTaken: "FLAGGED_FOR_REVIEW",
        resourceType: "post",
        resourceId: postId,
        source: "moderator",
        actorId: moderator.uid,
        reasonSummary: "Post approved by moderator",
        reasonDetails: justification,
      });
    } else if (action === "quarantine") {
      await postRepository.updatePost(postId, {
        moderationStatus: ModerationStatus.Pending,
        reviewedBy: moderator.uid,
        reviewedAt: now,
      });
      await logModerationEvent({
        userId: post.userId,
        timestamp: now,
        verdict: ModerationStatus.Pending,
        categories: categories,
        actionTaken: "FLAGGED_FOR_REVIEW",
        resourceType: "post",
        resourceId: postId,
        source: "moderator",
        actorId: moderator.uid,
        reasonSummary: "Post moved to quarantine by moderator",
        reasonDetails: justification,
      });
    }

    if (banAuthor && post.userId) {
      try {
        await this.banUser(post.userId, `Decision on post ${postId}`);
      } catch (error) {
        console.error(
          `[ReviewPost] Failed to ban user ${post.userId} after post review.`,
          error,
        );
      }
    }
  }
}
