import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "@/features/me/me.type";
import type { PostContentService } from "@/features/posts/api/services/post.content.service";

import type { CommentRepository } from "../../repositories/comment.repository.interface";
import {
  PublicCommentResponseDto as PublicCommentResponse,
  UpdateCommentRequestDto as UpdateCommentRequest,
  UpdateCommentSchema,
} from "../../../types/comment.dto";

import type { CommentEnricher } from "../comment.enricher";
import {
  assertCommentAuthor,
  assertCommentExists,
  requireSession,
} from "../comment.guards";
import { toModerationContext } from "@/features/moderation/api/repositories/moderationLog.supabase.mapper";

export class UpdateCommentUseCase {
  constructor(
    private readonly repository: CommentRepository,
    private readonly contentService: PostContentService,
    private readonly enricher: CommentEnricher,
    private readonly session: SessionData | null,
  ) {}

  async execute(
    commentId: string,
    data: UpdateCommentRequest,
  ): Promise<PublicCommentResponse> {
    const user = requireSession(this.session);

    const parsed = UpdateCommentSchema.safeParse(data);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[UpdateCommentUseCase] Invalid data",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const comment = await this.repository.getCommentById(commentId);
    assertCommentExists(comment, "UpdateCommentUseCase");
    assertCommentAuthor(comment, user.uid);

    const processed = await this.contentService.process(
      user.uid,
      data.text,
      "comments",
      undefined,
    );

    const updated = await this.repository.updateComment(commentId, {
      text: data.text,
      isEdited: true,
      isPending: processed.isPending,
      moderationStatus: processed.isPending ? "pending" : "visible",
      moderationContext: toModerationContext(
        processed.moderationLogPayloadForResource,
      ),
      isNSFW: processed.isNSFW,
      updatedAt: new Date(),
    });

    await logActivity(
      user.uid,
      "COMMENT_UPDATED",
      `User updated comment ${commentId}`,
    );

    return this.enricher.enrichOne(updated, this.session);
  }
}
