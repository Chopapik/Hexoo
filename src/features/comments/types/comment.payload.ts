import { FieldValue } from "firebase-admin/firestore";
import { CommentEntity } from "./comment.entity";

export type CreateCommentPayload = Omit<
  CommentEntity,
  "id" | "createdAt" | "updatedAt"
> & {
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
};

export type UpdateCommentPayload = Partial<
  Omit<CommentEntity, "id" | "userId" | "postId" | "createdAt">
> & {
  updatedAt?: Date | FieldValue;
};
