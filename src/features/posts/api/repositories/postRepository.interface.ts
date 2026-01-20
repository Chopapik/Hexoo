import { Post, CreatePost, UpdatePost } from "@/features/posts/types/post.type";

export interface IPostRepository {
  createPost(post: any): Promise<void>;
  updatePost(postId: string, data: Partial<Post>): Promise<void>;
  getPostById(postId: string): Promise<Post | null>;
  getPosts(limit: number, startAfterId?: string): Promise<Post[]>;
  getPostsByUserId(
    userId: string,
    limit: number,
    startAfterId?: string,
  ): Promise<Post[]>;
  reportPost(
    postId: string,
    reportDetails: { userId: string; reason: string; details?: string },
  ): Promise<{ hidden: boolean; reportsCount: number }>;
}
