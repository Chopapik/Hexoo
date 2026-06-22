import { createAppError } from "@/lib/AppError";
import type { SessionData } from "@/features/me/me.type";
import type { PostEntity } from "../../types/post.entity";

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

export function assertPostExists(
  post: PostEntity | null,
  context = "post",
): asserts post is PostEntity {
  if (!post) {
    throw createAppError({
      code: "NOT_FOUND",
      message: `[${context}] Post not found`,
    });
  }
}

export function assertPostAuthor(post: PostEntity, userId: string): void {
  if (post.userId !== userId) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "Not author of post",
    });
  }
}
