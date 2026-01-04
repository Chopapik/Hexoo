import { firestore } from "firebase-admin";

export interface Like {
  parentId: string;
  userId: string;
  likedAt: firestore.Timestamp | firestore.FieldValue;
}

export interface ToggleLikeResult {
  isLiked: boolean;
  likesCount: number;
}
