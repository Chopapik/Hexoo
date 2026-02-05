import type { ModerationPostDto } from "@/features/posts/types/post.dto";

export interface ModeratorService {
  getModerationQueue(): Promise<ModerationPostDto[]>;
  reviewPost(
    postId: string,
    action: "approve" | "reject" | "quarantine",
    banAuthor?: boolean,
  ): Promise<void>;
}
