import { ModerationStatus } from "@/features/shared/types/content.type";
import {
  CreatePostDto,
  PublicPostDto,
  UpdatePostDto,
} from "../../types/post.dto";

export interface PostService {
  reportPost(
    postId: string,
    reason: string,
    details?: string,
  ): Promise<{ hidden: boolean; reportsCount: number }>;
  createPost(data: CreatePostDto): Promise<void>;
  updatePost(postId: string, data: UpdatePostDto): Promise<PublicPostDto>;
  deletePost(postId: string): Promise<void>;
  setModerationStatus(
    postId: string,
    status: ModerationStatus.Approved | ModerationStatus.Pending,
  ): Promise<void>;
  getPostById(postId: string): Promise<PublicPostDto>;
  getPosts(limit?: number, startAfterId?: string): Promise<PublicPostDto[]>;
  getPostsByUserId(
    userId: string,
    limit?: number,
    startAfterId?: string,
  ): Promise<PublicPostDto[]>;
}
