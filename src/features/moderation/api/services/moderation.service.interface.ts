import type { ModerationCommentResponseDto as ModerationCommentResponse } from "@/features/comments/types/comment.dto";
import type { ModerationPostResponseDto as ModerationPostResponse } from "@/features/posts/types/post.dto";

export interface ModerationService {
  getModerationQueueForPosts(
    limit?: number,
    startAfterId?: string,
  ): Promise<ModerationPostResponse[]>;
  getModerationQueueForComments(
    limit?: number,
    startAfterId?: string,
  ): Promise<ModerationCommentResponse[]>;
}
