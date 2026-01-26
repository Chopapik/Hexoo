import { Like } from "@/features/likes/types/like.type";

export interface LikeRepository {
  toggleLike(
    userId: string,
    parentId: string,
    parentCollection: "posts" | "comments",
  ): Promise<void>;
  getLikesForParents(userId: string, parentIds: string[]): Promise<string[]>;
}
