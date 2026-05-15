import type { SessionData } from "@/features/me/me.type";

import type { CommentService as ICommentService } from "./comment.service.interface";
import type {
  AddCommentRequestDto as AddCommentRequest,
  AddCommentResponseDto as AddCommentResponse,
  PublicCommentResponseDto as PublicCommentResponse,
  UpdateCommentRequestDto as UpdateCommentRequest,
} from "../../types/comment.dto";

import type { AddCommentUseCase } from "./use-cases/add-comment.use-case";
import type { UpdateCommentUseCase } from "./use-cases/update-comment.use-case";
import type { DeleteCommentUseCase } from "./use-cases/delete-comment.use-case";
import type { ReportCommentUseCase } from "./use-cases/report-comment.use-case";
import type { GetCommentsByPostIdUseCase } from "./use-cases/get-comments-by-post-id.use-case";

export class CommentService implements ICommentService {
  constructor(
    private readonly addCommentUseCase: AddCommentUseCase,
    private readonly getCommentsByPostIdUseCase: GetCommentsByPostIdUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
    private readonly reportCommentUseCase: ReportCommentUseCase,
  ) {}

  async addComment(data: AddCommentRequest): Promise<AddCommentResponse> {
    return this.addCommentUseCase.execute(data);
  }

  async getCommentsByPostId(postId: string): Promise<PublicCommentResponse[]> {
    return this.getCommentsByPostIdUseCase.execute(postId);
  }

  async updateComment(
    commentId: string,
    data: UpdateCommentRequest,
  ): Promise<PublicCommentResponse> {
    return this.updateCommentUseCase.execute(commentId, data);
  }

  async deleteComment(commentId: string): Promise<void> {
    return this.deleteCommentUseCase.execute(commentId);
  }

  async reportComment(
    commentId: string,
    reason: string,
    details?: string,
  ): Promise<{ hidden: boolean; reportsCount: number }> {
    return this.reportCommentUseCase.execute(commentId, reason, details);
  }
}
