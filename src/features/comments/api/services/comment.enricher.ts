import { getUsersByIds } from "@/features/users/api/services";
import type { LikeRepository } from "@/features/likes/api/repositories";
import type { SessionData } from "@/features/me/me.type";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";

import type { CommentEntity } from "../../types/comment.entity";
import type { PublicCommentResponseDto as PublicCommentResponse } from "../../types/comment.dto";

type PublicComment = PublicCommentResponse;

export class CommentEnricher {
  constructor(private readonly likeRepository: LikeRepository) {}

  async enrich(
    comments: CommentEntity[],
    session: SessionData | null,
  ): Promise<PublicComment[]> {
    if (comments.length === 0) return [];

    const authorIds = [...new Set(comments.map((comment) => comment.userId))];
    const authors = await getUsersByIds(authorIds);

    const likedCommentIds =
      session && comments.length > 0
        ? await this.likeRepository.getLikesForParents(
            session.uid,
            "comments",
            comments.map((comment) => comment.id),
          )
        : [];

    const likedCommentIdSet = new Set(likedCommentIds);

    return comments.map((doc) => {
      const author = authors[doc.userId];
      return {
        ...doc,
        imageUrl: resolveImagePublicUrl(doc.imageMeta) ?? null,
        userName: author?.name ?? "Unknown",
        userAvatarUrl: resolveImagePublicUrl(author?.avatarMeta) ?? null,
        isLikedByMe: likedCommentIdSet.has(doc.id),
      } satisfies PublicComment;
    });
  }

  async enrichOne(
    comment: CommentEntity,
    session: SessionData | null,
  ): Promise<PublicComment> {
    const [enriched] = await this.enrich([comment], session);
    return enriched;
  }
}
