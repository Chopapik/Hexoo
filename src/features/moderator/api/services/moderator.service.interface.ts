import type { ModerationPostDto } from "@/features/posts/types/post.dto";
import type { BlockUserDto } from "@/features/users/types/user.dto";

export interface ModeratorService {
  getModerationQueue(): Promise<ModerationPostDto[]>;
  reviewPost(
    postId: string,
    action: "approve" | "reject" | "quarantine",
    banAuthor: boolean | undefined,
    categories: string[],
    justification: string,
  ): Promise<void>;
  blockUser(data: BlockUserDto): Promise<void>;
  unblockUser(uid: string): Promise<void>;
}
