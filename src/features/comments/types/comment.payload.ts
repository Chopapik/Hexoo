import { CommentEntity } from "./comment.entity";

export type CreateCommentPayload = Omit<
  CommentEntity,
  "id" | "createdAt" | "updatedAt"
> & {
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateCommentPayload = Partial<
  Omit<CommentEntity, "id" | "userId" | "postId" | "createdAt">
> & {
  updatedAt?: Date;
};
