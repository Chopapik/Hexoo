import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { deleteImage } from "@/features/images/api/imageService";
import {
  getUsersByIds,
  getUserByUid,
} from "@/features/users/api/services";
import { likeRepository } from "@/features/likes/api/repositories";

import { Post } from "../../types/post.entity";
import {
  CreatePostDto,
  UpdatePostDto,
  CreatePostSchema,
  UpdatePostSchema,
  PostResponseDto,
} from "../../types/post.dto";
import { SessionData } from "@/features/me/me.type";

import {
  PostRepository,
  CreatePostDBInput,
} from "../repositories/post.repository.interface";
import { PostContentService } from "./post.content.service";

export class PostService {
  constructor(
    private readonly repository: PostRepository,
    private readonly contentService: PostContentService,
    private readonly user: SessionData | null = null,
  ) {}

  private ensureUser(): SessionData {
    if (!this.user) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message: "User session required",
      });
    }
    return this.user;
  }

  private validateRestricted() {
    const user = this.ensureUser();
    if (user.isRestricted) {
      throw createAppError({
        code: "FORBIDDEN",
        data: { reason: "account_restricted" },
      });
    }
  }

  private async enrichPosts(posts: Post[]): Promise<PostResponseDto[]> {
    if (posts.length === 0) return [];

    const authorIds = [...new Set(posts.map((post) => post.userId))];
    const authors = await getUsersByIds(authorIds);

    const visiblePostIds = posts.map((post) => post.id);
    let likedPostIds: string[] = [];

    if (this.user && visiblePostIds.length > 0) {
      likedPostIds = await likeRepository.getLikesForParents(
        this.user.uid,
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

  async createPost(createPostData: CreatePostDto) {
    this.validateRestricted();

    const parsed = CreatePostSchema.safeParse(createPostData);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "Invalid post data",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const user = this.ensureUser();
    const processed = await this.contentService.process(
      user.uid,
      createPostData.text,
      createPostData.imageFile,
    );

    const dbInput: CreatePostDBInput = {
      userId: user.uid,
      text: createPostData.text,
      device: "Web",
      imageUrl: processed.imageUrl ?? null,
      imageMeta: processed.imageMeta ?? null,
      moderationStatus: processed.moderationStatus,
      isNSFW: processed.isNSFW,
      flaggedReasons: processed.flaggedReasons,
      likesCount: 0,
      commentsCount: 0,
      userReports: [],
      reportsMeta: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.repository.createPost(dbInput);
  }

  async updatePost(
    postId: string,
    updateData: UpdatePostDto,
  ): Promise<PostResponseDto> {
    const parsed = UpdatePostSchema.safeParse(updateData);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "Invalid update data",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const user = this.ensureUser();
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
      updatedAt: new Date(),
    });

    return await this.getPostById(postId);
  }

  async getPostById(postId: string): Promise<PostResponseDto> {
    if (!postId?.trim())
      throw createAppError({ code: "NOT_FOUND", message: "Empty ID" });

    const post = await this.repository.getPostById(postId);
    if (!post)
      throw createAppError({ code: "NOT_FOUND", message: "Post not found" });

    const enriched = await this.enrichPosts([post]);
    return enriched[0];
  }

  async getPosts(
    limit = 20,
    startAfterId?: string,
  ): Promise<PostResponseDto[]> {
    const posts = await this.repository.getPosts(limit, startAfterId);
    return this.enrichPosts(posts);
  }

  async getPostsByUserId(
    userId: string,
    limit = 20,
    startAfterId?: string,
  ): Promise<PostResponseDto[]> {
    const posts = await this.repository.getPostsByUserId(
      userId,
      limit,
      startAfterId,
    );
    return this.enrichPosts(posts);
  }

  async reportPost(postId: string, reason: string, details?: string) {
    const user = this.ensureUser();
    return await this.repository.reportPost(postId, {
      uid: user.uid,
      reason,
      details,
      createdAt: new Date(),
    });
  }
}
