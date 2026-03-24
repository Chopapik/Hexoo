import type { ModerationCommentResponseDto as ModerationCommentResponse } from "@/features/comments/types/comment.dto";
import type { ModerationPostResponseDto as ModerationPostResponse } from "@/features/posts/types/post.dto";
import type { BlockUserRequestDto as BlockUserRequest } from "@/features/users/types/user.dto";

export interface ModeratorService {
  getModerationQueueForPosts(
    limit?: number,
    startAfterId?: string,
  ): Promise<ModerationPostResponse[]>;
  getModerationQueueForComments(
    limit?: number,
    startAfterId?: string,
  ): Promise<ModerationCommentResponse[]>;
  reviewPost(
    postId: string,
    action: "approve" | "reject" | "quarantine",
    banAuthor: boolean | undefined,
    categories: string[],
    justification: string,
  ): Promise<void>;
  reviewComment(
    commentId: string,
    action: "approve" | "reject" | "quarantine",
    banAuthor: boolean | undefined,
    categories: string[],
    justification: string,
  ): Promise<void>;
  blockUser(data: BlockUserRequest): Promise<void>;
  unblockUser(uid: string): Promise<void>;
}
