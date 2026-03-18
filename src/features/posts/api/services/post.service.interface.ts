import { ModerationStatus } from "@/features/shared/types/content.type";
import {
  CreatePostRequestDto as CreatePostRequest,
  CreatePostResponseDto as CreatePostResponse,
  PublicPostResponseDto as PublicPostResponse,
  UpdatePostRequestDto as UpdatePostRequest,
} from "../../types/post.dto";

export interface PostService {
  reportPost(
    postId: string,
    reason: string,
    details?: string,
  ): Promise<{ hidden: boolean; reportsCount: number }>;
  createPost(data: CreatePostRequest): Promise<CreatePostResponse>;
  updatePost(
    postId: string,
    data: UpdatePostRequest,
  ): Promise<PublicPostResponse>;
  deletePost(postId: string): Promise<void>;
  setModerationStatus(
    postId: string,
    status: ModerationStatus.Approved | ModerationStatus.Pending,
  ): Promise<void>;
  getPostById(postId: string): Promise<PublicPostResponse>;
  getPosts(
    limit?: number,
    startAfterId?: string,
  ): Promise<PublicPostResponse[]>;
  getPostsByUserId(
    userId: string,
    limit?: number,
    startAfterId?: string,
  ): Promise<PublicPostResponse[]>;
}
