import { ContentBase } from "@/features/shared/types/content.type";

export type CommentEntity = ContentBase & {
  postId: string;
};
