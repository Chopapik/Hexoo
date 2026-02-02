import type { ToggleLikePayload } from "@/features/likes/types/like.payload";

export interface LikeRepository {
  toggleLike(payload: ToggleLikePayload): Promise<void>;
  getLikesForParents(userId: string, parentIds: string[]): Promise<string[]>;
}
