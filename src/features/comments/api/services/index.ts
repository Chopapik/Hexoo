import { commentRepository } from "../repositories";
import { likeRepository } from "@/features/likes/api/repositories";
import { PostContentService } from "@/features/posts/api/services/post.content.service";
import { CommentService } from "./comment.service";
import { CommentEnricher } from "./comment.enricher";
import {
  AddCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  ReportCommentUseCase,
  GetCommentsByPostIdUseCase,
} from "./use-cases";
import type {
  AddCommentRequestDto as AddCommentRequest,
  AddCommentResponseDto as AddCommentResponse,
  UpdateCommentRequestDto as UpdateCommentRequest,
  PublicCommentResponseDto as PublicCommentResponse,
} from "../../types/comment.dto";
import type { SessionData } from "@/features/me/me.type";
import { deleteImage } from "@/features/images/api/image.service";

const postContentService = new PostContentService();
const commentEnricher = new CommentEnricher(likeRepository);

export const getCommentService = (
  session: SessionData | null,
): CommentService => {
  const addCommentUseCase = new AddCommentUseCase(
    commentRepository,
    postContentService,
    session,
    deleteImage,
  );

  const getCommentsByPostIdUseCase = new GetCommentsByPostIdUseCase(
    commentRepository,
    commentEnricher,
    session,
  );

  const updateCommentUseCase = new UpdateCommentUseCase(
    commentRepository,
    postContentService,
    commentEnricher,
    session,
  );

  const deleteCommentUseCase = new DeleteCommentUseCase(
    commentRepository,
    deleteImage,
    session,
  );

  const reportCommentUseCase = new ReportCommentUseCase(
    commentRepository,
    session,
  );

  return new CommentService(
    addCommentUseCase,
    getCommentsByPostIdUseCase,
    updateCommentUseCase,
    deleteCommentUseCase,
    reportCommentUseCase,
  );
};

export async function addComment(
  session: SessionData | null,
  data: AddCommentRequest,
): Promise<AddCommentResponse> {
  const service = getCommentService(session);
  return await service.addComment(data);
}

export async function getCommentsByPostId(
  session: SessionData | null,
  postId: string,
) {
  const service = getCommentService(session);
  return await service.getCommentsByPostId(postId);
}

export async function updateComment(
  session: SessionData | null,
  commentId: string,
  data: UpdateCommentRequest,
): Promise<PublicCommentResponse> {
  const service = getCommentService(session);
  return await service.updateComment(commentId, data);
}

export async function deleteComment(
  session: SessionData | null,
  commentId: string,
): Promise<void> {
  const service = getCommentService(session);
  return await service.deleteComment(commentId);
}

export async function reportComment(
  session: SessionData | null,
  commentId: string,
  reason: string,
  details?: string,
) {
  const service = getCommentService(session);
  return await service.reportComment(commentId, reason, details);
}

export { CommentService };
