import type { ModerationPostResponseDto as ModerationPostResponse } from "@/features/posts/types/post.dto";
import type { BlockUserRequestDto as BlockUserRequest } from "@/features/users/types/user.dto";

export interface ModeratorService {
  getModerationQueue(
    limit?: number,
    startAfterId?: string,
  ): Promise<ModerationPostResponse[]>;
  reviewPost(
    postId: string,
    action: "approve" | "reject" | "quarantine",
    banAuthor: boolean | undefined,
    categories: string[],
    justification: string,
  ): Promise<void>;
  blockUser(data: BlockUserRequest): Promise<void>;
  unblockUser(uid: string): Promise<void>;
}
