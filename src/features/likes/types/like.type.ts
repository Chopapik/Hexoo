export type Like = {
  uid: string;
  userName: string;
  userAvatarUrl: string | null;
  likedAt: any;
};

export type ToggleLikeResult = {
  isLiked: boolean;
  likesCount: number;
};
