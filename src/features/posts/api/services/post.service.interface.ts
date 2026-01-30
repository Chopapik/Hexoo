import type { SessionData } from "@/features/me/me.type";
import {
  CreatePostDto,
  PublicPostDto,
  UpdatePostDto,
} from "../../types/post.dto";

export interface PostService {
  reportPost(
    session: SessionData,
    postId: string,
    reason: string,
    details?: string,
  ): Promise<{ hidden: boolean; reportsCount: number }>;
  createPost(session: SessionData, data: CreatePostDto): Promise<void>;
  updatePost(
    session: SessionData,
    postId: string,
    data: UpdatePostDto,
  ): Promise<PublicPostDto>;
  getPostById(postId: string): Promise<PublicPostDto>;
  getPosts(
    limit?: number,
    startAfterId?: string,
    session?: SessionData | null,
  ): Promise<PublicPostDto[]>;
  getPostsByUserId(
    userId: string,
    limit?: number,
    startAfterId?: string,
    session?: SessionData | null,
  ): Promise<PublicPostDto[]>;
}
