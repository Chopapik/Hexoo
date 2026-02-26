import type { ModerationPostDto } from "@/features/posts/types/post.dto";

export interface ModerationService {
  getModerationQueue(limit?: number): Promise<ModerationPostDto[]>;
}

