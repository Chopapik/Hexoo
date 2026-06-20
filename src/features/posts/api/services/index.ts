import { postRepository } from "../repositories";
import { likeRepository } from "@/features/likes/api/repositories";
import { deleteImage } from "@/features/images/api/image.service";
import { PostContentService } from "./post.content.service";
import { PostEnricher } from "./post.enricher";
import { PostModerationWorkflow } from "./post.moderation-workflow";
import { PostService } from "./post.service";
import {
  CreatePostUseCase,
  DeletePostUseCase,
  ReportPostUseCase,
  UpdatePostUseCase,
} from "./use-cases";
import type {
  CreatePostRequestDto as CreatePostRequest,
  CreatePostResponseDto as CreatePostResponse,
  UpdatePostRequestDto as UpdatePostRequest,
  PublicPostResponseDto as PublicPostResponse,
} from "../../types/post.dto";
import type { ModerationStatus } from "@/features/shared/types/content.type";
import type { SessionData } from "@/features/me/me.type";
import { commentRepository } from "@/features/comments/api/repositories";

const postContentService = new PostContentService();
const postEnricher = new PostEnricher(likeRepository);
const postModerationWorkflow = new PostModerationWorkflow(postRepository);

export const getPostService = (
  session: SessionData | null,
): PostService => {
  const createPostUseCase = new CreatePostUseCase(
    postRepository,
    postContentService,
    postModerationWorkflow,
    session,
    deleteImage,
  );

  const updatePostUseCase = new UpdatePostUseCase(
    postRepository,
    postContentService,
    postModerationWorkflow,
    postEnricher,
    deleteImage,
    session,
  );

  const deletePostUseCase = new DeletePostUseCase(
    postRepository,
    deleteImage,
    (postId) => commentRepository.getImageMetasByPostId(postId),
    session,
  );

  const reportPostUseCase = new ReportPostUseCase(
    postRepository,
    postModerationWorkflow,
    session,
  );

  return new PostService(
    postRepository,
    postEnricher,
    postModerationWorkflow,
    createPostUseCase,
    updatePostUseCase,
    deletePostUseCase,
    reportPostUseCase,
    session,
  );
};

export async function createPost(
  session: SessionData | null,
  data: CreatePostRequest,
): Promise<CreatePostResponse> {
  const service = getPostService(session);
  return await service.createPost(data);
}

export async function updatePost(
  session: SessionData | null,
  postId: string,
  data: UpdatePostRequest,
): Promise<PublicPostResponse> {
  const service = getPostService(session);
  return await service.updatePost(postId, data);
}

export async function deletePost(
  session: SessionData | null,
  postId: string,
): Promise<void> {
  const service = getPostService(session);
  return await service.deletePost(postId);
}

export async function getPostById(
  session: SessionData | null,
  postId: string,
): Promise<PublicPostResponse> {
  const service = getPostService(session);
  return await service.getPostById(postId);
}

export async function getPosts(
  session: SessionData | null,
  limit?: number,
  startAfterId?: string,
): Promise<PublicPostResponse[]> {
  const service = getPostService(session);
  return await service.getPosts(limit, startAfterId);
}

export async function getPostsByUserId(
  session: SessionData | null,
  userId: string,
  limit?: number,
  startAfterId?: string,
): Promise<PublicPostResponse[]> {
  const service = getPostService(session);
  return await service.getPostsByUserId(userId, limit, startAfterId);
}

export async function reportPost(
  session: SessionData | null,
  postId: string,
  reason: string,
  details?: string,
) {
  const service = getPostService(session);
  return await service.reportPost(postId, reason, details);
}

export async function setModerationStatus(
  session: SessionData | null,
  postId: string,
  status: ModerationStatus.Approved | ModerationStatus.Pending,
): Promise<void> {
  const service = getPostService(session);
  return await service.setModerationStatus(postId, status);
}

export { PostService };
