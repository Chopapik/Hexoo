import { postRepository } from "@/features/posts/api/repositories";
import type { ModerationPostResponseDto as ModerationPostResponse } from "@/features/posts/types/post.dto";
import { getModerationLogsForResource } from "../moderationLog.service";
import type { ModerationEnricher } from "../moderation.enricher";

export class GetModerationQueueForPostsUseCase {
  constructor(private readonly enricher: ModerationEnricher) {}

  async execute(
    limit: number = 50,
    startAfterId?: string,
  ): Promise<ModerationPostResponse[]> {
    const posts = await postRepository.getPostsPendingModeration(
      limit,
      startAfterId,
    );
    if (posts.length === 0) return [];

    const postIds = posts.map((post) => post.id);
    const latestLogByPostId = await getModerationLogsForResource(
      "post",
      postIds,
    );

    return this.enricher.enrichPosts(posts, latestLogByPostId);
  }
}
