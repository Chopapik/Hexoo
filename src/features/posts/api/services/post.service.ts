import { createAppError } from "@/lib/AppError";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type { SessionData } from "@/features/me/me.type";

import type { PostRepository } from "../repositories/post.repository.interface";
import type { PostService as IPostService } from "./post.service.interface";

import type {
  CreatePostRequestDto as CreatePostRequest,
  CreatePostResponseDto as CreatePostResponse,
  UpdatePostRequestDto as UpdatePostRequest,
  PublicPostResponseDto as PublicPostResponse,
} from "../../types/post.dto";

import type { CreatePostUseCase } from "./use-cases/create-post.use-case";
import type { UpdatePostUseCase } from "./use-cases/update-post.use-case";
import type { DeletePostUseCase } from "./use-cases/delete-post.use-case";
import type { ReportPostUseCase } from "./use-cases/report-post.use-case";

import type { PostEnricher } from "./post.enricher";
import type { PostModerationWorkflow } from "./post.moderation-workflow";

export class PostService implements IPostService {
  constructor(
    private readonly repository: PostRepository,
    private readonly enricher: PostEnricher,
    private readonly moderationWorkflow: PostModerationWorkflow,
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly reportPostUseCase: ReportPostUseCase,
    private readonly session: SessionData | null = null,
  ) {}

  async createPost(data: CreatePostRequest): Promise<CreatePostResponse> {
    return this.createPostUseCase.execute(data);
  }

  async updatePost(
    postId: string,
    data: UpdatePostRequest,
  ): Promise<PublicPostResponse> {
    return this.updatePostUseCase.execute(postId, data);
  }

  async deletePost(postId: string): Promise<void> {
    return this.deletePostUseCase.execute(postId);
  }

  async reportPost(
    postId: string,
    reason: string,
    details?: string,
  ): Promise<{ hidden: boolean; reportsCount: number }> {
    return this.reportPostUseCase.execute(postId, reason, details);
  }

  async setModerationStatus(
    postId: string,
    status: ModerationStatus.Approved | ModerationStatus.Pending,
  ): Promise<void> {
    return this.moderationWorkflow.setModerationStatus(postId, status);
  }

  async getPostById(postId: string): Promise<PublicPostResponse> {
    if (!postId?.trim()) {
      throw createAppError({
        code: "NOT_FOUND",
        message: "Empty ID",
      });
    }

    const post = await this.repository.getPostById(postId);

    if (!post) {
      throw createAppError({
        code: "NOT_FOUND",
        message: "Post not found",
      });
    }

    return this.enricher.enrichOne(post, this.session);
  }

  async getPosts(
    limit = 20,
    startAfterId?: string,
  ): Promise<PublicPostResponse[]> {
    const posts = await this.repository.getPosts(limit, startAfterId);
    return this.enricher.enrich(posts, this.session);
  }

  async getPostsByUserId(
    userId: string,
    limit = 20,
    startAfterId?: string,
  ): Promise<PublicPostResponse[]> {
    const posts = await this.repository.getPostsByUserId(
      userId,
      limit,
      startAfterId,
    );

    return this.enricher.enrich(posts, this.session);
  }
}
