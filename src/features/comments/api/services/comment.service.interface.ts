import type {
  AddCommentRequestDto as AddCommentRequest,
  AddCommentResponseDto as AddCommentResponse,
  PublicCommentResponseDto as PublicCommentResponse,
} from "../../types/comment.dto";

export interface CommentService {
  addComment(data: AddCommentRequest): Promise<AddCommentResponse>;
  getCommentsByPostId(postId: string): Promise<PublicCommentResponse[]>;
}
