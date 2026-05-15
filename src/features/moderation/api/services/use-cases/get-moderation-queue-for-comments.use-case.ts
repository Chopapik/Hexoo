import { commentRepository } from "@/features/comments/api/repositories";
import { postRepository } from "@/features/posts/api/repositories";
import type { ModerationCommentResponseDto as ModerationCommentResponse } from "@/features/comments/types/comment.dto";
import { getModerationLogsForResource } from "../moderationLog.service";
import type { ModerationEnricher } from "../moderation.enricher";

export class GetModerationQueueForCommentsUseCase {
  constructor(private readonly enricher: ModerationEnricher) {}

  async execute(
    limit: number = 50,
    startAfterId?: string,
  ): Promise<ModerationCommentResponse[]> {
    const comments = await commentRepository.getCommentsPendingModeration(
      limit,
      startAfterId,
    );
    if (comments.length === 0) return [];

    const parentPostIds = [...new Set(comments.map((comment) => comment.postId))];
    const parentPosts = await postRepository.getPostsByIds(parentPostIds);

    const commentIds = comments.map((comment) => comment.id);
    const latestLogByCommentId = await getModerationLogsForResource(
      "comment",
      commentIds,
    );

    return this.enricher.enrichComments(
      comments,
      parentPosts,
      latestLogByCommentId,
    );
  }
}
