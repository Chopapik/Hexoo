import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "@/features/me/me.type";

import type { CommentRepository } from "../../repositories/comment.repository.interface";

import {
  assertCommentAuthor,
  assertCommentExists,
  requireSession,
} from "../comment.guards";

export class DeleteCommentUseCase {
  constructor(
    private readonly repository: CommentRepository,
    private readonly session: SessionData | null,
  ) {}

  async execute(commentId: string): Promise<void> {
    const user = requireSession(this.session);

    const comment = await this.repository.getCommentById(commentId);
    assertCommentExists(comment, "DeleteCommentUseCase");
    assertCommentAuthor(comment, user.uid);

    await this.repository.deleteComment(commentId, comment.postId);

    await logActivity(
      user.uid,
      "COMMENT_DELETED",
      `User deleted comment ${commentId}`,
    );
  }
}
