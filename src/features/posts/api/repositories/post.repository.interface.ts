import { PostEntity } from "../../types/post.entity";
import { ReportDetails } from "@/features/shared/types/report.type";
import { CreatePostPayload, UpdatePostPayload } from "../../types/post.payload";

export interface PostRepository {
  createPost(data: CreatePostPayload): Promise<void>;

  updatePost(postId: string, data: UpdatePostPayload): Promise<void>;

  deletePost(postId: string): Promise<void>;

  getPostById(postId: string): Promise<PostEntity | null>;

  getPosts(limit: number, startAfterId?: string): Promise<PostEntity[]>;

  getPostsByUserId(
    userId: string,
    limit: number,
    startAfterId?: string,
  ): Promise<PostEntity[]>;

  reportPost(
    postId: string,
    reportDetails: ReportDetails,
  ): Promise<{ hidden: boolean; reportsCount: number }>;
}
