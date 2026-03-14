import type { ModerationPostDto } from "@/features/posts/types/post.dto";
import type { ModerationResourceType } from "@/features/moderation/types/moderation.type";

export interface ModerationService {
  getModerationQueue(
    resourceType: ModerationResourceType,
    limit?: number,
  ): Promise<ModerationPostDto[]>;
}

