import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { getUsersByIds } from "@/features/users/api/services";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type { LikeRepository } from "@/features/likes/api/repositories";
import {
  getLatestModerationLogForResource,
  logModerationEvent,
} from "@/features/moderation/api/services/moderationLog.service";

import { PostEntity } from "../../types/post.entity";
import {
  CreatePostRequestDto as CreatePostRequest,
  CreatePostResponseDto as CreatePostResponse,
  UpdatePostRequestDto as UpdatePostRequest,
  CreatePostSchema,
  UpdatePostSchema,
  PublicPostResponseDto as PublicPostResponse,
} from "../../types/post.dto";
import { SessionData } from "@/features/me/me.type";

import { PostRepository } from "../repositories/post.repository.interface";
import { PostContentService } from "./post.content.service";
import { PostService as IPostService } from "./post.service.interface";
import { CreatePostPayload } from "../../types/post.payload";
import { logActivity } from "@/features/activity/api/services";
import { ImageMeta } from "@/features/images/types/image.type";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
type CreatePostInput = CreatePostRequest;
type CreatePostResult = CreatePostResponse;
type UpdatePostInput = UpdatePostRequest;
type PublicPost = PublicPostResponse;

type ImageDeleter = (meta: ImageMeta | null | undefined) => Promise<void>;

export class PostService implements IPostService {
  constructor(
    private readonly repository: PostRepository,
    private readonly contentService: PostContentService,
    private readonly likeRepository: LikeRepository,
    private readonly imageDeleter: ImageDeleter,
    private readonly session: SessionData | null = null,
  ) {}

  private ensureUser(): SessionData {
    if (!this.session) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message: "User session required",
      });
    }
    return this.session;
  }

  private validateRestricted(session: SessionData) {
    if (session.isRestricted) {
      throw createAppError({
        code: "FORBIDDEN",
        data: { reason: "account_restricted" },
      });
    }
  }

  private async enrichPosts(posts: PostEntity[]): Promise<PublicPost[]> {
    if (posts.length === 0) return [];

    const authorIds = [...new Set(posts.map((post) => post.userId))];
    const authors = await getUsersByIds(authorIds);

    const visiblePostIds = posts.map((post) => post.id);
    let likedPostIds: string[] = [];

    if (this.session && visiblePostIds.length > 0) {
      likedPostIds = await this.likeRepository.getLikesForParents(
        this.session.uid,
        visiblePostIds,
      );
    }

    const moderationInfoByPostId: Record<string, PublicPost["moderationInfo"]> =
      {};

    if (this.session) {
      // Preload latest moderation info only for posts authored by current user
      await Promise.all(
        posts
          .filter((post) => post.userId === this.session!.uid)
          .map(async (post) => {
            const log = await getLatestModerationLogForResource(
              "post",
              post.id,
            );
            if (log) {
              moderationInfoByPostId[post.id] = {
                verdict: log.verdict,
                actionTaken: log.actionTaken,
                categories: log.categories,
                reasonSummary: log.reasonSummary,
                reasonDetails: log.reasonDetails,
              };
            }
          }),
      );
    }

    return posts.map((post) => {
      const author = authors[post.userId];
      return {
        ...post,
        imageUrl: resolveImagePublicUrl(post.imageMeta) ?? null,
        userName: author?.name ?? "Unknown",
        userAvatarUrl: resolveImagePublicUrl(author?.avatarMeta) ?? null,
        isLikedByMe: likedPostIds.includes(post.id),
        moderationInfo:
          this.session && post.userId === this.session.uid
            ? moderationInfoByPostId[post.id]
            : undefined,
      };
    });
  }

  async createPost(createPostData: CreatePostInput): Promise<CreatePostResult> {
    const user = this.ensureUser();
    this.validateRestricted(user);

    const parsed = CreatePostSchema.safeParse(createPostData);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "Invalid post data",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const processed = await this.contentService.process(
      user.uid,
      createPostData.text,
      "posts",
      createPostData.imageFile,
    );

    const dbInput: CreatePostPayload = {
      userId: user.uid,
      text: createPostData.text,
      device: "Web",
      imageMeta: processed.imageMeta ?? null,
      isPending: processed.isPending,
      isNSFW: processed.isNSFW,
      likesCount: 0,
      commentsCount: 0,
      userReports: [],
      reportsMeta: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const postId = await this.repository.createPost(dbInput);

    if (processed.moderationLogPayloadForResource) {
      await logModerationEvent({
        ...processed.moderationLogPayloadForResource,
        resourceType: "post",
        resourceId: postId,
      });
    }

    await logActivity(user.uid, "POST_CREATED", "User created a new post");

    return {
      postId,
      isPending: processed.isPending,
      isNSFW: processed.isNSFW,
    };
  }

  async deletePost(postId: string): Promise<void> {
    const user = this.ensureUser();

    if (!postId?.trim()) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[postService.deletePost] Empty postId",
      });
    }

    const post = await this.repository.getPostById(postId);
    if (!post) {
      throw createAppError({ code: "NOT_FOUND", message: "Post not found" });
    }

    if (post.userId !== user.uid) {
      throw createAppError({
        code: "FORBIDDEN",
        message: "Not author of post",
      });
    }

    if (post.imageMeta) {
      await this.imageDeleter(post.imageMeta);
    }

    await this.repository.deletePost(postId);

    await logActivity(user.uid, "POST_DELETED", `User deleted post ${postId}`);
  }

  async setModerationStatus(
    postId: string,
    status: ModerationStatus.Approved | ModerationStatus.Pending,
  ) {
    const post = await this.repository.getPostById(postId);
    if (!post) {
      throw createAppError({ code: "NOT_FOUND", message: "Post not found" });
    }

    await this.repository.updatePost(postId, {
      isPending: status === ModerationStatus.Pending,
    });

    if (post.userId) {
      await logActivity(
        post.userId,
        "POST_MODERATION_STATUS_CHANGED",
        `Moderation status of post ${postId} changed to ${status}`,
      );
    }
  }

  async updatePost(
    postId: string,
    updateData: UpdatePostInput,
  ): Promise<PublicPost> {
    const user = this.ensureUser();

    const parsed = UpdatePostSchema.safeParse(updateData);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "Invalid update data",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const post = await this.repository.getPostById(postId);
    if (!post)
      throw createAppError({ code: "NOT_FOUND", message: "Post not found" });

    if (post.userId !== user.uid) {
      throw createAppError({
        code: "FORBIDDEN",
        message: "Not author of post",
      });
    }

    const processed = await this.contentService.process(
      user.uid,
      updateData.text ?? post.text,
      "posts",
      updateData.imageFile,
    );

    if (processed.moderationLogPayloadForResource) {
      await logModerationEvent({
        ...processed.moderationLogPayloadForResource,
        resourceType: "post",
        resourceId: postId,
      });
    }

    if (processed.imageMeta && post.imageMeta) {
      await this.imageDeleter(post.imageMeta);
    }

    await this.repository.updatePost(postId, {
      text: updateData.text ?? post.text,
      imageMeta: processed.imageMeta ?? post.imageMeta,
      isPending: processed.isPending,
      isNSFW: processed.isNSFW,
      isEdited: true,
      updatedAt: new Date(),
    });

    await logActivity(user.uid, "POST_UPDATED", `User updated post ${postId}`);

    return await this.getPostById(postId);
  }

  async getPostById(postId: string): Promise<PublicPost> {
    if (!postId?.trim())
      throw createAppError({ code: "NOT_FOUND", message: "Empty ID" });

    const post = await this.repository.getPostById(postId);
    if (!post)
      throw createAppError({ code: "NOT_FOUND", message: "Post not found" });

    const enriched = await this.enrichPosts([post]);
    return enriched[0];
  }

  async getPosts(limit = 20, startAfterId?: string): Promise<PublicPost[]> {
    const posts = await this.repository.getPosts(limit, startAfterId);
    return this.enrichPosts(posts);
  }

  async getPostsByUserId(
    userId: string,
    limit = 20,
    startAfterId?: string,
  ): Promise<PublicPost[]> {
    const posts = await this.repository.getPostsByUserId(
      userId,
      limit,
      startAfterId,
    );
    return this.enrichPosts(posts);
  }

  async reportPost(postId: string, reason: string, details?: string) {
    const user = this.ensureUser();

    const post = await this.repository.getPostById(postId);
    if (!post) {
      throw createAppError({
        code: "NOT_FOUND",
        message: "[postService.reportPost] Post not found",
      });
    }

    const result = await this.repository.reportPost(postId, {
      uid: user.uid,
      reason,
      details,
      createdAt: new Date(),
    });

    await logModerationEvent({
      userId: post.userId,
      timestamp: new Date(),
      verdict: ModerationStatus.Pending,
      categories: [reason],
      actionTaken: "FLAGGED_FOR_REVIEW",
      resourceType: "post",
      resourceId: postId,
      source: "user_report",
      actorId: user.uid,
      reasonSummary: "Post reported by user",
      reasonDetails: details ? `${reason}: ${details}` : reason,
    });

    await logActivity(
      user.uid,
      "POST_REPORTED",
      `User reported post ${postId} for: ${reason}`,
    );

    return result;
  }
}
