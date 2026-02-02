export type LikeParentCollection = "posts" | "comments";

export interface ToggleLikeDto {
  parentId: string;
  parentCollection: LikeParentCollection;
}

export interface ToggleLikeResultDto {
  parentId: string;
  isLiked: boolean;
  likesCount: number;
}
