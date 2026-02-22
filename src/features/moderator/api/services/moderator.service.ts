import { createAppError } from "@/lib/AppError";
import { postRepository } from "@/features/posts/api/repositories";
import { blockUser, getUsersByIds } from "@/features/users/api/services";
import { deleteImage } from "@/features/images/api/imageService";
import { ModerationPostDto } from "@/features/posts/types/post.dto";
import { UserRole } from "@/features/users/types/user.type";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type { SessionData } from "@/features/me/me.type";
import type { ModeratorService as IModeratorService } from "./moderator.service.interface";

export class ModeratorService implements IModeratorService {
  constructor(private readonly session: SessionData | null) {}

  private ensureModeratorOrAdmin(): SessionData {
    const session = this.session;
    if (!session) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message: "[moderatorService.ensureModeratorOrAdmin] No session found",
      });
    }
    if (session.role !== UserRole.Moderator && session.role !== UserRole.Admin) {
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

    const posts = await postRepository.getPostsPendingModeration(50);
    if (posts.length === 0) return [];

    const authorIds = [...new Set(posts.map((post) => post.userId))];
    const authors = await getUsersByIds(authorIds);

    return posts.map((post) => {
      const author = authors[post.userId];
      return {
        ...post,
        userName: author?.name ?? "Unknown",
        userAvatarUrl: author?.avatarUrl ?? null,
      };
    });
  }

  async reviewPost(
    postId: string,
    action: "approve" | "reject" | "quarantine",
    banAuthor: boolean = false,
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

    if (action === "reject") {
      if (post.imageMeta?.storagePath) {
        await deleteImage(post.imageMeta.storagePath);
      }
      await postRepository.deletePost(postId);
    } else if (action === "approve") {
      const now = new Date();
      await postRepository.updatePost(postId, {
        moderationStatus: ModerationStatus.Approved,
        flaggedReasons: [],
        reviewedBy: moderator.uid,
        reviewedAt: now,
      });
    } else if (action === "quarantine") {
      const now = new Date();
      await postRepository.updatePost(postId, {
        moderationStatus: ModerationStatus.Pending,
        reviewedBy: moderator.uid,
        reviewedAt: now,
      });
    }

    if (banAuthor && post.userId) {
      try {
        await blockUser(moderator, {
          uidToBlock: post.userId,
          bannedBy: moderator.uid,
          bannedReason: `Decision on post ${postId}`,
        });
      } catch (error) {
        console.error(
          `[ReviewPost] Failed to ban user ${post.userId} after post review.`,
          error,
        );
      }
    }
  }
}
