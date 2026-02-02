import { FieldValue } from "firebase-admin/firestore";
import type { LikeParentCollection } from "./like.dto";

export type ToggleLikePayload = {
  userId: string;
  parentId: string;
  parentCollection: LikeParentCollection;
};

export type CreateLikePayload = {
  parentId: string;
  userId: string;
  likedAt: Date | FieldValue;
};
