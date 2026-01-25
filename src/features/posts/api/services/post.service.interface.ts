import type { SessionData } from "@/features/me/me.type";
import {
  CreatePostDto,
  PostResponseDto,
  UpdatePostDto,
} from "../../types/post.dto";

export interface IPostService {
  reportPost(
    session: SessionData,
    postId: string,
    reason: string,
    details?: string,
  ): Promise<{ hidden: boolean; reportsCount: number }>;
  createPost(
    session: SessionData,
    data: CreatePostDto,
  ): Promise<PostResponseDto>;
  updatePost(
    session: SessionData,
    postId: string,
    data: UpdatePostDto,
  ): Promise<PostResponseDto>;
  getPostById(postId: string): Promise<PostResponseDto>;
  getPosts(
    limit?: number,
    startAfterId?: string,
    session?: SessionData | null,
  ): Promise<PostResponseDto[]>;
  getPostsByUserId(
    userId: string,
    limit?: number,
    startAfterId?: string,
    session?: SessionData | null,
  ): Promise<PostResponseDto[]>;
}
