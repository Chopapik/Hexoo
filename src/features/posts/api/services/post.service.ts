import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { deleteImage } from "@/features/images/api/imageService";
import { getUsersByIds } from "@/features/users/api/services";
import { likeRepository } from "@/features/likes/api/repositories";
//move likerepository & imagerepostory outside to avoid violating S in SOLID

import { PostEntity } from "../../types/post.entity";
import {
  CreatePostDto,
  UpdatePostDto,
  CreatePostSchema,
  UpdatePostSchema,
  PublicPostDto,
} from "../../types/post.dto";
import { SessionData } from "@/features/me/me.type";

import { PostRepository } from "../repositories/post.repository.interface";
import { PostContentService } from "./post.content.service";
import { PostService as IPostService } from "./post.service.interface";
import { CreatePostPayload } from "../../types/post.payload";

export class PostService implements IPostService {
  constructor(
    private readonly repository: PostRepository,
    private readonly contentService: PostContentService,
  ) {}

  private ensureUser(session: SessionData | null): SessionData {
    if (!session) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message: "User session required",
      });
    }
    return session;
  }

  private validateRestricted(session: SessionData) {
    if (session.isRestricted) {
      throw createAppError({
        code: "FORBIDDEN",
        data: { reason: "account_restricted" },
      });
    }
  }

  private async enrichPosts(
    posts: PostEntity[],
    session: SessionData | null,
  ): Promise<PublicPostDto[]> {
    if (posts.length === 0) return [];

    const authorIds = [...new Set(posts.map((post) => post.userId))];
    const authors = await getUsersByIds(authorIds);

    const visiblePostIds = posts.map((post) => post.id);
    let likedPostIds: string[] = [];

    if (session && visiblePostIds.length > 0) {
      likedPostIds = await likeRepository.getLikesForParents(
        session.uid,
        visiblePostIds,
      );
    }

    return posts.map((post) => {
      const author = authors[post.userId];
      return {
        ...post,
        userName: author?.name ?? "Unknown",
        userAvatarUrl: author?.avatarUrl ?? null,
        isLikedByMe: likedPostIds.includes(post.id),
      };
    });
  }

  async createPost(
    session: SessionData,
    createPostData: CreatePostDto,
  ): Promise<void> {
    const user = this.ensureUser(session);
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
      createPostData.imageFile,
    );

    const dbInput: CreatePostPayload = {
      userId: user.uid,
      text: createPostData.text,
      device: "Web",
      imageUrl: processed.imageUrl ?? null,
      imageMeta: processed.imageMeta ?? null,
      moderationStatus: processed.moderationStatus,
      isNSFW: processed.isNSFW,
      flaggedReasons: processed.flaggedReasons,
      flaggedSource: processed.flaggedSource,
      likesCount: 0,
      commentsCount: 0,
      userReports: [],
      reportsMeta: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.repository.createPost(dbInput);
  }

  async deletePost(postId: string) {
    await this.repository.deletePost(postId);
  }

  async setModerationStatus(postId: string, status: "approved" | "pending") {
    await this.repository.updatePost(postId, {
      moderationStatus: status,
    });
  }

  async updatePost(
    session: SessionData,
    postId: string,
    updateData: UpdatePostDto,
  ): Promise<PublicPostDto> {
    const user = this.ensureUser(session);

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
      updateData.imageFile,
    );

    if (processed.imageUrl && post.imageMeta?.storagePath) {
      await deleteImage(post.imageMeta.storagePath);
    }

    await this.repository.updatePost(postId, {
      text: updateData.text ?? post.text,
      imageUrl: processed.imageUrl ?? post.imageUrl,
      imageMeta: processed.imageMeta ?? post.imageMeta,
      moderationStatus: processed.moderationStatus,
      isNSFW: processed.isNSFW,
      flaggedReasons: processed.flaggedReasons,
      flaggedSource: processed.flaggedSource,
      updatedAt: new Date(),
    });

    return await this.getPostById(postId, session);
  }

  async getPostById(
    postId: string,
    session: SessionData | null = null,
  ): Promise<PublicPostDto> {
    if (!postId?.trim())
      throw createAppError({ code: "NOT_FOUND", message: "Empty ID" });

    const post = await this.repository.getPostById(postId);
    if (!post)
      throw createAppError({ code: "NOT_FOUND", message: "Post not found" });

    const enriched = await this.enrichPosts([post], session);
    return enriched[0];
  }

  async getPosts(
    limit = 20,
    startAfterId?: string,
    session: SessionData | null = null,
  ): Promise<PublicPostDto[]> {
    const posts = await this.repository.getPosts(limit, startAfterId);
    return this.enrichPosts(posts, session);
  }

  async getPostsByUserId(
    userId: string,
    limit = 20,
    startAfterId?: string,
    session: SessionData | null = null,
  ): Promise<PublicPostDto[]> {
    const posts = await this.repository.getPostsByUserId(
      userId,
      limit,
      startAfterId,
    );
    return this.enrichPosts(posts, session);
  }

  async reportPost(
    session: SessionData,
    postId: string,
    reason: string,
    details?: string,
  ) {
    const user = this.ensureUser(session);
    return await this.repository.reportPost(postId, {
      uid: user.uid,
      reason,
      details,
      createdAt: new Date(),
    });
  }
}
