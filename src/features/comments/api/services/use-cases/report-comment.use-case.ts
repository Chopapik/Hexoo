import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "@/features/me/me.type";

import type { CommentRepository } from "../../repositories/comment.repository.interface";
import { ReportCommentSchema } from "../../../types/comment.dto";

import { assertCommentExists, requireSession } from "../comment.guards";

export class ReportCommentUseCase {
  constructor(
    private readonly repository: CommentRepository,
    private readonly session: SessionData | null,
  ) {}

  async execute(
    commentId: string,
    reason: string,
    details?: string,
  ): Promise<{ hidden: boolean; reportsCount: number }> {
    const user = requireSession(this.session);

    const parsed = ReportCommentSchema.safeParse({ reason, details });
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[ReportCommentUseCase] Invalid data",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const comment = await this.repository.getCommentById(commentId);
    assertCommentExists(comment, "ReportCommentUseCase");

    const result = await this.repository.reportComment(commentId, {
      uid: user.uid,
      reason,
      details,
      createdAt: new Date(),
    });

    await logActivity(
      user.uid,
      "COMMENT_REPORTED",
      `User reported comment ${commentId} for: ${reason}`,
    );

    return result;
  }
}
