import type { ModerationPostDto } from "@/features/posts/types/post.dto";

export interface ModeratorService {
  getModerationQueue(): Promise<ModerationPostDto[]>;
  reviewPost(
    postId: string,
    action: "approve" | "reject" | "quarantine",
    banAuthor: boolean | undefined,
    categories: string[],
    justification: string,
  ): Promise<void>;
  banUser(uid: string, reason: string): Promise<void>;
}
