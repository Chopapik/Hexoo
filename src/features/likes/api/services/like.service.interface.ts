import type {
  LikeParentCollection,
  SetLikeStateResponseDto,
} from "@/features/likes/types/like.dto";

export interface LikeService {
  setLikeState(
    parentId: string,
    parentCollection: LikeParentCollection,
    liked: boolean,
  ): Promise<SetLikeStateResponseDto>;
  getLikesForParents(
    userId: string,
    parentCollection: LikeParentCollection,
    parentIds: string[],
  ): Promise<string[]>;
}
