import { getUsersByIds } from "@/features/users/api/services";
import type { LikeRepository } from "@/features/likes/api/repositories";
import type { SessionData } from "@/features/me/me.type";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import {
  getModerationLogsForResource,
  type ModerationLogPayload,
} from "@/features/moderation/api/services/moderationLog.service";

import type { PostEntity } from "../../types/post.entity";
import type { PublicPostResponseDto as PublicPostResponse } from "../../types/post.dto";

type PublicPost = PublicPostResponse;

export class PostEnricher {
  constructor(private readonly likeRepository: LikeRepository) {}

  async enrich(
    posts: PostEntity[],
    session: SessionData | null,
  ): Promise<PublicPost[]> {
    if (posts.length === 0) return [];

    const authorIds = [...new Set(posts.map((post) => post.userId))];
    const visiblePostIds = posts.map((post) => post.id);

    const ownPostIds =
      session === null
        ? []
        : posts
            .filter((post) => post.userId === session.uid)
            .map((post) => post.id);

    const [authors, likedPostIds, moderationLogsByPostId] = await Promise.all([
      getUsersByIds(authorIds),

      session && visiblePostIds.length > 0
        ? this.likeRepository.getLikesForParents(session.uid, visiblePostIds)
        : Promise.resolve<string[]>([]),

      ownPostIds.length > 0
        ? getModerationLogsForResource("post", ownPostIds)
        : Promise.resolve<Record<string, ModerationLogPayload>>({}),
    ]);

    const likedPostIdSet = new Set(likedPostIds);

    return posts.map((post) => {
      const author = authors[post.userId];
      const moderationLog =
        session && post.userId === session.uid
          ? moderationLogsByPostId[post.id]
          : undefined;

      return {
        ...post,
        imageUrl: resolveImagePublicUrl(post.imageMeta) ?? null,
        userName: author?.name ?? "Deleted user",
        userAvatarUrl: resolveImagePublicUrl(author?.avatarMeta) ?? null,
        isLikedByMe: likedPostIdSet.has(post.id),
        moderationInfo: moderationLog
          ? {
              verdict: moderationLog.verdict,
              actionTaken: moderationLog.actionTaken,
              categories: moderationLog.categories,
              reasonSummary: moderationLog.reasonSummary,
              reasonDetails: moderationLog.reasonDetails,
            }
          : undefined,
      };
    });
  }

  async enrichOne(
    post: PostEntity,
    session: SessionData | null,
  ): Promise<PublicPost> {
    const [enriched] = await this.enrich([post], session);
    return enriched;
  }
}
