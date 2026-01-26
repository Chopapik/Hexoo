import { PostService } from "./post.service";
import { PostContentService } from "./post.content.service";
import { postRepository } from "../repositories";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import {
  CreatePostDto,
  UpdatePostDto,
  PostResponseDto,
} from "../../types/post.dto";

const postContentService = new PostContentService();

export const getPostService = async (): Promise<PostService> => {
  const session = await getUserFromSession().catch(() => null);
  return new PostService(postRepository, postContentService, session);
};

export async function createPost(createPostData: CreatePostDto) {
  const service = await getPostService();
  return await service.createPost(createPostData);
}

export async function updatePost(
  postId: string,
  updateData: UpdatePostDto,
): Promise<PostResponseDto> {
  const service = await getPostService();
  return await service.updatePost(postId, updateData);
}

export async function getPostById(postId: string): Promise<PostResponseDto> {
  const service = await getPostService();
  return await service.getPostById(postId);
}

export async function getPosts(
  limit = 20,
  startAfterId?: string,
): Promise<PostResponseDto[]> {
  const service = await getPostService();
  return await service.getPosts(limit, startAfterId);
}

export async function getPostsByUserId(
  userId: string,
  limit = 20,
  startAfterId?: string,
): Promise<PostResponseDto[]> {
  const service = await getPostService();
  return await service.getPostsByUserId(userId, limit, startAfterId);
}

export async function reportPost(
  postId: string,
  reason: string,
  details?: string,
) {
  const session = await getUserFromSession();
  const service = new PostService(postRepository, postContentService, session);
  return await service.reportPost(postId, reason, details);
}

export { PostService };
export type { PostResponseDto };
