import type { SetLikeStatePayload } from "@/features/likes/types/like.payload";
import type {
  LikeParentCollection,
  SetLikeStateResponseDto,
} from "@/features/likes/types/like.dto";

export interface LikeRepository {
  setLikeState(payload: SetLikeStatePayload): Promise<SetLikeStateResponseDto>;
  getLikesForParents(
    userId: string,
    parentCollection: LikeParentCollection,
    parentIds: string[],
  ): Promise<string[]>;
}
