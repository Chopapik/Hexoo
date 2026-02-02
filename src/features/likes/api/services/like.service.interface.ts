import type { LikeParentCollection } from "@/features/likes/types/like.dto";

export interface LikeService {
  toggleLike(
    parentId: string,
    parentCollection: LikeParentCollection,
  ): Promise<void>;
  getLikesForParents(userId: string, parentIds: string[]): Promise<string[]>;
}
