import { CommentEntity } from "./comment.entity";
import type { Json } from "@/lib/supabase.database.types";

export type CreateCommentPayload = Omit<
  CommentEntity,
  "id" | "createdAt" | "updatedAt"
> & {
  createdAt: Date;
  updatedAt: Date;
  moderationContext?: Json | null;
};

export type UpdateCommentPayload = Partial<
  Omit<CommentEntity, "id" | "userId" | "postId" | "createdAt">
> & {
  updatedAt?: Date;
  moderationContext?: Json | null;
};
