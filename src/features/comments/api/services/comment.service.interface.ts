import type {
  AddCommentRequestDto as AddCommentRequest,
  AddCommentResponseDto as AddCommentResponse,
  PublicCommentResponseDto as PublicCommentResponse,
  UpdateCommentRequestDto as UpdateCommentRequest,
} from "../../types/comment.dto";

export interface CommentService {
  addComment(data: AddCommentRequest): Promise<AddCommentResponse>;
  getCommentsByPostId(postId: string): Promise<PublicCommentResponse[]>;
  updateComment(
    commentId: string,
    data: UpdateCommentRequest,
  ): Promise<PublicCommentResponse>;
  deleteComment(commentId: string): Promise<void>;
}
