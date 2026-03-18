export type LikeParentCollection = "posts" | "comments";

export interface ToggleLikeRequestDto {
  parentId: string;
  parentCollection: LikeParentCollection;
}

export interface ToggleLikeResponseDto {
  parentId: string;
  isLiked: boolean;
  likesCount: number;
}
