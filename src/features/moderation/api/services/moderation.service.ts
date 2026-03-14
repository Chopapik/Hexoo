import { postRepository } from "@/features/posts/api/repositories";
import { getUsersByIds } from "@/features/users/api/services";
import type { ModerationPostDto } from "@/features/posts/types/post.dto";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type { ModerationResourceType } from "@/features/moderation/types/moderation.type";
import { getModerationLogsForResource } from "./moderationLog.service";
import type { ModerationService as IModerationService } from "./moderation.service.interface";

export class ModerationService implements IModerationService {
  async getModerationQueue(
    resourceType: ModerationResourceType,
    limit: number = 50,
  ): Promise<ModerationPostDto[]> {
    // Currently only posts are supported; comments can be added later.
    if (resourceType !== "post") {
      throw new Error(
        `[ModerationService.getModerationQueue] Unsupported resourceType: ${resourceType}`,
      );
    }

    const posts = await postRepository.getPostsPendingModeration(limit);
    if (posts.length === 0) return [];

    const authorIds = [...new Set(posts.map((post) => post.userId))];
    const authors = await getUsersByIds(authorIds);

    const postIds = posts.map((post) => post.id);
    const latestLogByPostId = await getModerationLogsForResource(
      "post",
      postIds,
    );

    return posts.map((post) => {
      const author = authors[post.userId];
      const latestLog = latestLogByPostId[post.id];

      return {
        ...post,
        moderationStatus: latestLog?.verdict ?? ModerationStatus.Pending,
        flaggedReasons: latestLog?.categories ?? [],
        moderationInfo: latestLog
          ? {
              verdict: latestLog.verdict,
              actionTaken: latestLog.actionTaken,
              categories: latestLog.categories,
              reasonSummary: latestLog.reasonSummary,
              reasonDetails: latestLog.reasonDetails,
              source: latestLog.source,
              actorId: latestLog.actorId,
            }
          : undefined,
        userName: author?.name ?? "Unknown",
        userAvatarUrl: author?.avatarUrl ?? null,
      };
    });
  }
}

