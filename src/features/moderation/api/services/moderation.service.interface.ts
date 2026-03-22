import type { ModerationPostResponseDto as ModerationPostResponse } from "@/features/posts/types/post.dto";
import type { ModerationResourceType } from "@/features/moderation/types/moderation.type";

export interface ModerationService {
  getModerationQueue(
    resourceType: ModerationResourceType,
    limit?: number,
    startAfterId?: string,
  ): Promise<ModerationPostResponse[]>;
}

