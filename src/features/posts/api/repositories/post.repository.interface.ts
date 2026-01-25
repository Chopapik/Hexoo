import { PostResponseDto } from "../../types/post.dto";
import { Post } from "../../types/post.entity";
import { ReportDetails } from "../../types/post.type";

export type CreatePostDBInput = Partial<Omit<Post, "id">>;

export type UpdatePostDBInput = Partial<
  Omit<Post, "id" | "createdAt" | "userId">
>;

export interface PostRepository {
  createPost(data: CreatePostDBInput): Promise<void>;

  updatePost(postId: string, data: UpdatePostDBInput): Promise<void>;

  getPostById(postId: string): Promise<Post | null>;

  getPosts(limit: number, startAfterId?: string): Promise<Post[]>;

  getPostsByUserId(
    userId: string,
    limit: number,
    startAfterId?: string,
  ): Promise<Post[]>;

  reportPost(
    postId: string,
    reportDetails: ReportDetails,
  ): Promise<{ hidden: boolean; reportsCount: number }>;
}
