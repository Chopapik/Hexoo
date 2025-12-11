export type Like = {
  parentId: string;
  userId: string;
  likedAt: any;
};

export type ToggleLikeResult = {
  isLiked: boolean;
  likesCount: number;
};
