import { getUsersByIds } from "@/features/users/api/services";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type { ModerationLogPayload } from "./moderationLog.service";
import type { CommentEntity } from "@/features/comments/types/comment.entity";
import type { PostEntity } from "@/features/posts/types/post.entity";
import type { ModerationCommentResponseDto as ModerationCommentResponse } from "@/features/comments/types/comment.dto";
import type { ModerationPostResponseDto as ModerationPostResponse } from "@/features/posts/types/post.dto";
import { deriveCanonicalContentStatus } from "@/features/moderation/types/moderation.type";

type ModerationInfo = NonNullable<ModerationPostResponse["moderationInfo"]>;

export class ModerationEnricher {
  private buildModerationFields(
    isPending: boolean,
    latestLog: ModerationLogPayload | undefined,
  ) {
    return {
      moderationStatus: deriveCanonicalContentStatus({
        isPending,
        decision: latestLog?.verdict,
        reasonSummary: latestLog?.reasonSummary,
      }),
      flaggedReasons: latestLog?.categories ?? [],
      moderationInfo: latestLog
        ? ({
            verdict: latestLog.verdict,
            actionTaken: latestLog.actionTaken,
            categories: latestLog.categories,
            reasonSummary: latestLog.reasonSummary,
            reasonDetails: latestLog.reasonDetails,
            source: latestLog.source,
            actorId: latestLog.actorId,
          } satisfies ModerationInfo)
        : undefined,
    };
  }

  async enrichPosts(
    posts: PostEntity[],
    latestLogByPostId: Record<string, ModerationLogPayload>,
  ): Promise<ModerationPostResponse[]> {
    if (posts.length === 0) return [];

    const authorIds = [...new Set(posts.map((post) => post.userId))];
    const authors = await getUsersByIds(authorIds);

    return posts.map((post) => {
      const author = authors[post.userId];
      const latestLog = latestLogByPostId[post.id];

      return {
        ...post,
        ...this.buildModerationFields(Boolean(post.isPending), latestLog),
        imageUrl: resolveImagePublicUrl(post.imageMeta) ?? null,
        userName: author?.name ?? "Unknown",
        userAvatarUrl: resolveImagePublicUrl(author?.avatarMeta) ?? null,
      };
    });
  }

  async enrichComments(
    comments: CommentEntity[],
    parentPosts: PostEntity[],
    latestLogByCommentId: Record<string, ModerationLogPayload>,
  ): Promise<ModerationCommentResponse[]> {
    if (comments.length === 0) return [];

    const parentById = new Map(parentPosts.map((post) => [post.id, post]));

    const commentAuthorIds = [...new Set(comments.map((comment) => comment.userId))];
    const parentAuthorIds = [...new Set(parentPosts.map((post) => post.userId))];
    const authorIds = [...new Set([...commentAuthorIds, ...parentAuthorIds])];
    const authors = await getUsersByIds(authorIds);

    return comments.map((comment) => {
      const author = authors[comment.userId];
      const latestLog = latestLogByCommentId[comment.id];
      const parentPost = parentById.get(comment.postId);
      const parentAuthor = parentPost ? authors[parentPost.userId] : undefined;

      return {
        ...comment,
        ...this.buildModerationFields(Boolean(comment.isPending), latestLog),
        imageUrl: resolveImagePublicUrl(comment.imageMeta) ?? null,
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
