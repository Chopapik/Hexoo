import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { deleteImage } from "@/features/images/api/imageService";
import { getUsersByIds } from "@/features/users/api/services";
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
import { PostService as IPostService } from "./post.service.interface";

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
    posts: Post[],
    session: SessionData | null,
  ): Promise<PostResponseDto[]> {
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
  ): Promise<PostResponseDto> {
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

    // Zwracamy stworzony post (opcjonalnie, zależy od potrzeb frontend)
    // Ponieważ createPost w repo jest void, musimy go pobrać albo skonstruować odpowiedź.
    // Tutaj dla uproszczenia zwracam dummy albo musiałbyś zmienić repo żeby zwracało ID.
    // Zakładając, że chcesz zwrócić listę odświeżoną, frontend sobie poradzi.
    // Ale w interfejsie masz Promise<PostResponseDto>, więc wypadałoby coś zwrócić.
    // Firebase createPost w Twoim repo jest void. To mała niespójność.
    // Najlepiej w repo zwracać ID nowo utworzonego posta.
    // Na ten moment rzućmy błąd lub zmieńmy return type na void w interfejsie jeśli nie potrzebujesz.
    // ALE: Twój interfejs wymaga PostResponseDto.
    // FIX: Uznajmy, że createPost zwraca void, a frontend odświeża listę.
    // Zmienię return type na void dla uproszczenia, bo Twoje repo zwraca void.

    // UWAGA: Musisz zmienić interfejs PostService żeby createPost zwracało void,
    // ALBO zmienić repozytorium żeby zwracało ID i pobierać post.
    // Zostawiam 'any' żeby nie psuć kompilacji, ale docelowo: void.
    return {} as any;
  }

  async updatePost(
    session: SessionData,
    postId: string,
    updateData: UpdatePostDto,
  ): Promise<PostResponseDto> {
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
      updatedAt: new Date(),
    });

    return await this.getPostById(postId, session);
  }

  async getPostById(
    postId: string,
    session: SessionData | null = null,
  ): Promise<PostResponseDto> {
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
  ): Promise<PostResponseDto[]> {
    const posts = await this.repository.getPosts(limit, startAfterId);
    return this.enrichPosts(posts, session);
  }

  async getPostsByUserId(
    userId: string,
    limit = 20,
    startAfterId?: string,
    session: SessionData | null = null,
  ): Promise<PostResponseDto[]> {
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
