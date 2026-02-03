import type { AddCommentDto, PublicCommentDto } from "../../types/comment.dto";

export interface CommentService {
  addComment(data: AddCommentDto): Promise<void>;
  getCommentsByPostId(postId: string): Promise<PublicCommentDto[]>;
}
