import { postRepository } from "@/features/posts/api/repositories";
import { getUsersByIds } from "@/features/users/api/services";
import type { ModerationPostDto } from "@/features/posts/types/post.dto";
import type { ModerationService as IModerationService } from "./moderation.service.interface";

export class ModerationService implements IModerationService {
  async getModerationQueue(limit: number = 50): Promise<ModerationPostDto[]> {
    const posts = await postRepository.getPostsPendingModeration(limit);
    if (posts.length === 0) return [];

    const authorIds = [...new Set(posts.map((post) => post.userId))];
    const authors = await getUsersByIds(authorIds);

    return posts.map((post) => {
      const author = authors[post.userId];
      return {
        ...post,
        userName: author?.name ?? "Unknown",
        userAvatarUrl: author?.avatarUrl ?? null,
      };
    });
  }
}

