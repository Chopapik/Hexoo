import { commentRepository } from "@/features/comments/api/repositories";
import type { ModerationCommentResponseDto as ModerationCommentResponse } from "@/features/comments/types/comment.dto";
import { postRepository } from "@/features/posts/api/repositories";
import type { ModerationPostResponseDto as ModerationPostResponse } from "@/features/posts/types/post.dto";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { getModerationLogsForResource } from "./moderationLog.service";
import type { ModerationService as IModerationService } from "./moderation.service.interface";
import { getUsersByIds } from "@/features/users/api/services";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";

export class ModerationService implements IModerationService {
  async getModerationQueueForPosts(
    limit: number = 50,
    startAfterId?: string,
  ): Promise<ModerationPostResponse[]> {
    const posts = await postRepository.getPostsPendingModeration(
      limit,
      startAfterId,
    );
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
        imageUrl: resolveImagePublicUrl(post.imageMeta) ?? null,
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
        userAvatarUrl: resolveImagePublicUrl(author?.avatarMeta) ?? null,
      };
    });
  }

  async getModerationQueueForComments(
    limit: number = 50,
    startAfterId?: string,
  ): Promise<ModerationCommentResponse[]> {
    const comments = await commentRepository.getCommentsPendingModeration(
      limit,
      startAfterId,
    );
    if (comments.length === 0) return [];

    const parentPostIds = [...new Set(comments.map((c) => c.postId))];
    const parentPosts = await postRepository.getPostsByIds(parentPostIds);
    const parentById = new Map(parentPosts.map((p) => [p.id, p]));

    const commentAuthorIds = [...new Set(comments.map((c) => c.userId))];
    const parentAuthorIds = [
      ...new Set(parentPosts.map((p) => p.userId)),
    ];
    const authorIds = [...new Set([...commentAuthorIds, ...parentAuthorIds])];
    const authors = await getUsersByIds(authorIds);

    const commentIds = comments.map((c) => c.id);
    const latestLogByCommentId = await getModerationLogsForResource(
      "comment",
      commentIds,
    );

    return comments.map((comment) => {
      const author = authors[comment.userId];
      const latestLog = latestLogByCommentId[comment.id];
      const parentPost = parentById.get(comment.postId);
      const parentAuthor = parentPost ? authors[parentPost.userId] : undefined;

      return {
        ...comment,
        imageUrl: resolveImagePublicUrl(comment.imageMeta) ?? null,
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
        userAvatarUrl: resolveImagePublicUrl(author?.avatarMeta) ?? null,
        parentPostPreview: parentPost
          ? {
              id: parentPost.id,
              text: parentPost.text,
              userName: parentAuthor?.name ?? "Unknown",
              userAvatarUrl:
                resolveImagePublicUrl(parentAuthor?.avatarMeta) ?? null,
              hasImage: Boolean(parentPost.imageMeta),
              imageUrl: resolveImagePublicUrl(parentPost.imageMeta) ?? null,
              isNSFW: parentPost.isNSFW,
            }
          : undefined,
      };
    });
  }
}
