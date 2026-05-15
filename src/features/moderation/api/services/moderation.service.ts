import type { ModerationCommentResponseDto as ModerationCommentResponse } from "@/features/comments/types/comment.dto";
import type { ModerationPostResponseDto as ModerationPostResponse } from "@/features/posts/types/post.dto";
import type { ModerationService as IModerationService } from "./moderation.service.interface";

import type { GetModerationQueueForPostsUseCase } from "./use-cases/get-moderation-queue-for-posts.use-case";
import type { GetModerationQueueForCommentsUseCase } from "./use-cases/get-moderation-queue-for-comments.use-case";

export class ModerationService implements IModerationService {
  constructor(
    private readonly getModerationQueueForPostsUseCase: GetModerationQueueForPostsUseCase,
    private readonly getModerationQueueForCommentsUseCase: GetModerationQueueForCommentsUseCase,
  ) {}

  async getModerationQueueForPosts(
    limit?: number,
    startAfterId?: string,
  ): Promise<ModerationPostResponse[]> {
    return this.getModerationQueueForPostsUseCase.execute(limit, startAfterId);
  }

  async getModerationQueueForComments(
    limit?: number,
    startAfterId?: string,
  ): Promise<ModerationCommentResponse[]> {
    return this.getModerationQueueForCommentsUseCase.execute(
      limit,
      startAfterId,
    );
  }
}
