import { createAppError } from "@/lib/AppError";
import type { SessionData } from "@/features/me/me.type";
import type { CommentEntity } from "../../types/comment.entity";

export function requireSession(session: SessionData | null): SessionData {
  if (!session) {
    throw createAppError({
      code: "AUTH_REQUIRED",
      message: "User session required",
    });
  }

  return session;
}

export function assertPostId(postId: string, context: string): void {
  if (!postId?.trim()) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: `[${context}] Empty postId`,
    });
  }
}

export function assertCommentExists(
  comment: CommentEntity | null,
  context = "comment",
): asserts comment is CommentEntity {
  if (!comment) {
    throw createAppError({
      code: "NOT_FOUND",
      message: `[${context}] Comment not found`,
    });
  }
}

export function assertCommentAuthor(
  comment: CommentEntity,
  userId: string,
): void {
  if (comment.userId !== userId) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "Not author of comment",
    });
  }
}
