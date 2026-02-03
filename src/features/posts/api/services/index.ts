import { postRepository } from "../repositories";
import { likeRepository } from "@/features/likes/api/repositories";
import { deleteImage } from "@/features/images/api/imageService";
import { PostContentService } from "./post.content.service";
import { PostService } from "./post.service";
import type {
  CreatePostDto,
  UpdatePostDto,
  PublicPostDto,
} from "../../types/post.dto";
import type { ModerationStatus } from "@/features/shared/types/content.type";
import type { SessionData } from "@/features/me/me.type";

const postContentService = new PostContentService();

export const getPostService = (
  session: SessionData | null,
): PostService => {
  return new PostService(
    postRepository,
    postContentService,
    likeRepository,
    deleteImage,
    session,
  );
};

export async function createPost(
  session: SessionData | null,
  data: CreatePostDto,
): Promise<void> {
  const service = getPostService(session);
  return await service.createPost(data);
}

export async function updatePost(
  session: SessionData | null,
  postId: string,
  data: UpdatePostDto,
): Promise<PublicPostDto> {
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
): Promise<PublicPostDto> {
  const service = getPostService(session);
  return await service.getPostById(postId);
}

export async function getPosts(
  session: SessionData | null,
  limit?: number,
  startAfterId?: string,
): Promise<PublicPostDto[]> {
  const service = getPostService(session);
  return await service.getPosts(limit, startAfterId);
}

export async function getPostsByUserId(
  session: SessionData | null,
  userId: string,
  limit?: number,
  startAfterId?: string,
): Promise<PublicPostDto[]> {
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
