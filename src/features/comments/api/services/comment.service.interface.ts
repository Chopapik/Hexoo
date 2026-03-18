import type {
  AddCommentDto,
  AddCommentResultDto,
  PublicCommentDto,
} from "../../types/comment.dto";

export interface CommentService {
  addComment(data: AddCommentDto): Promise<AddCommentResultDto>;
  getCommentsByPostId(postId: string): Promise<PublicCommentDto[]>;
}
