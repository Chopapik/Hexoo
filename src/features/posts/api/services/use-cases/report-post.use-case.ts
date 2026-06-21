import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "@/features/me/me.type";

import type { PostRepository } from "../../repositories/post.repository.interface";
import type { PostModerationWorkflow } from "../post.moderation-workflow";

import { ReportPostSchema } from "../../../types/post.dto";

import {
  assertPostExists,
  assertPostId,
  requireSession,
} from "../post.guards";

export class ReportPostUseCase {
  constructor(
    private readonly repository: PostRepository,
    _moderationWorkflow: PostModerationWorkflow,
    private readonly session: SessionData | null,
  ) {}

  async execute(
    postId: string,
    reason: string,
    details?: string,
  ): Promise<{ hidden: boolean; reportsCount: number }> {
    const user = requireSession(this.session);
    assertPostId(postId, "ReportPostUseCase");

    const parsed = ReportPostSchema.safeParse({ reason, details });

    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[ReportPostUseCase] Invalid data",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const data = parsed.data;

    const post = await this.repository.getPostById(postId);
    assertPostExists(post, "ReportPostUseCase");

    const alreadyReported = await this.repository.hasUserReportedPost(
      postId,
      user.uid,
    );

    if (alreadyReported) {
      throw createAppError({
        code: "CONFLICT",
        message: "[ReportPostUseCase] Post already reported by this user",
      });
    }

    const result = await this.repository.reportPost(postId, {
      uid: user.uid,
      reason: data.reason,
      details: data.details,
      createdAt: new Date(),
    });

    await logActivity(
      user.uid,
      "POST_REPORTED",
      `User reported post ${postId} for: ${data.reason}`,
    );

    return result;
  }
}
