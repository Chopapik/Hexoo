import { commentRepository } from "../repositories";
import { likeRepository } from "@/features/likes/api/repositories";
import { CommentService } from "./comment.service";
import type { AddCommentDto } from "../../types/comment.dto";
import type { SessionData } from "@/features/me/me.type";

export const getCommentService = (
  session: SessionData | null,
): CommentService => {
  return new CommentService(commentRepository, likeRepository, session);
};

export async function addComment(
  session: SessionData | null,
  data: AddCommentDto,
) {
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

export { CommentService };
