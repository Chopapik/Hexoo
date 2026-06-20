import type { LikeParentCollection } from "./like.dto";

export type SetLikeStatePayload = {
  userId: string;
  parentId: string;
  parentCollection: LikeParentCollection;
  liked: boolean;
};

export type CreateLikePayload = {
  parentId: string;
  userId: string;
  likedAt: Date;
};
