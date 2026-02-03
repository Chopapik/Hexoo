import type { CommentEntity } from "../../types/comment.entity";
import type { CreateCommentPayload } from "../../types/comment.payload";

export interface CommentRepository {
  createComment(
    postId: string,
    data: CreateCommentPayload,
  ): Promise<void>;
  getCommentsByPostId(postId: string): Promise<CommentEntity[]>;
}
