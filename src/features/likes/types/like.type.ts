export interface Like {
  parentId: string;
  userId: string;
  likedAt: any;
}

export interface ToggleLikeResult {
  isLiked: boolean;
  likesCount: number;
}
