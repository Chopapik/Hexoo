import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/users/api/services", () => ({
  getUsersByIds: vi.fn(),
}));

vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: vi.fn(),
}));

import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import type { CommentEntity } from "@/features/comments/types/comment.entity";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { ModerationLogPayload } from "@/features/moderation/api/repositories/moderationLog.repository.interface";
import type { PostEntity } from "@/features/posts/types/post.entity";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { getUsersByIds } from "@/features/users/api/services";
import { ModerationEnricher } from "../moderation.enricher";

const postAuthorAvatarMeta: ImageMeta = {
  storageBucket: "avatar-bucket-post-author-101",
  storageLocation: "avatars/post-author-101",
  fileName: "post-author-avatar-101.webp",
  downloadToken: "post-author-avatar-token-101",
  contentType: "image/webp",
  sizeBytes: 10101,
};

const commentAuthorAvatarMeta: ImageMeta = {
  storageBucket: "avatar-bucket-comment-author-202",
  storageLocation: "avatars/comment-author-202",
  fileName: "comment-author-avatar-202.webp",
  downloadToken: "comment-author-avatar-token-202",
  contentType: "image/webp",
  sizeBytes: 20202,
};

const parentAuthorAvatarMeta: ImageMeta = {
  storageBucket: "avatar-bucket-parent-author-303",
  storageLocation: "avatars/parent-author-303",
  fileName: "parent-author-avatar-303.webp",
  downloadToken: "parent-author-avatar-token-303",
  contentType: "image/webp",
  sizeBytes: 30303,
};

const postImageMeta: ImageMeta = {
  storageBucket: "post-image-bucket-404",
  storageLocation: "posts/post-image-404",
  fileName: "post-content-image-404.webp",
  downloadToken: "post-image-token-404",
  contentType: "image/webp",
  sizeBytes: 40404,
};

const commentImageMeta: ImageMeta = {
  storageBucket: "comment-image-bucket-505",
  storageLocation: "comments/comment-image-505",
  fileName: "comment-content-image-505.webp",
  downloadToken: "comment-image-token-505",
  contentType: "image/webp",
  sizeBytes: 50505,
};

const parentPostImageMeta: ImageMeta = {
  storageBucket: "parent-image-bucket-606",
  storageLocation: "posts/parent-image-606",
  fileName: "parent-preview-image-606.webp",
  downloadToken: "parent-image-token-606",
  contentType: "image/webp",
  sizeBytes: 60606,
};

function post(overrides: Partial<PostEntity> = {}): PostEntity {
  return {
    id: "post-base-701",
    userId: "post-author-base-701",
    text: "Base post text 701",
    likesCount: 7,
    commentsCount: 3,
    createdAt: new Date("2026-07-10T07:01:00.000Z"),
    updatedAt: new Date("2026-07-10T07:02:00.000Z"),
    isPending: false,
    moderationStatus: "visible",
    isNSFW: false,
    isEdited: false,
    imageMeta: null,
    ...overrides,
  };
}

function comment(overrides: Partial<CommentEntity> = {}): CommentEntity {
  return {
    id: "comment-base-801",
    postId: "parent-post-base-801",
    userId: "comment-author-base-801",
    text: "Base comment text 801",
    likesCount: 8,
    commentsCount: 0,
    createdAt: new Date("2026-07-10T08:01:00.000Z"),
    updatedAt: new Date("2026-07-10T08:02:00.000Z"),
    isPending: true,
    moderationStatus: "pending",
    isNSFW: true,
    isEdited: false,
    imageMeta: null,
    ...overrides,
  };
}

function moderationLog(
  overrides: Partial<ModerationLogPayload> = {},
): ModerationLogPayload {
  return {
    userId: "moderated-user-901",
    timestamp: new Date("2026-07-10T09:01:00.000Z"),
    verdict: ModerationStatus.Rejected,
    categories: ["violence-log-901", "spam-log-902"],
    actionTaken: "CONTENT_REMOVED",
    resourceType: "post",
    resourceId: "post-moderated-901",
    source: "moderator",
    actorId: "moderator-actor-901",
    reasonSummary: "Distinct moderation summary 901",
    reasonDetails: "Distinct moderation details 902",
    ...overrides,
  };
}

function imageUrlFor(meta: ImageMeta | null | undefined): string | null {
  if (!meta) return null;
  return `resolved://${meta.storageBucket}/${meta.storageLocation}/${meta.fileName}`;
}

describe("ModerationEnricher", () => {
  let enricher: ModerationEnricher;

  beforeEach(() => {
    vi.clearAllMocks();
    enricher = new ModerationEnricher();
    vi.mocked(getUsersByIds).mockResolvedValue({});
    vi.mocked(resolveImagePublicUrl).mockImplementation(imageUrlFor);
  });

  it("returns empty posts without calling dependencies", async () => {
    await expect(enricher.enrichPosts([], {})).resolves.toEqual([]);

    expect(getUsersByIds).not.toHaveBeenCalled();
    expect(resolveImagePublicUrl).not.toHaveBeenCalled();
  });

  it("returns empty comments without calling dependencies", async () => {
    await expect(
      enricher.enrichComments([], [post({ id: "unused-parent-post-001" })], {}),
    ).resolves.toEqual([]);

    expect(getUsersByIds).not.toHaveBeenCalled();
    expect(resolveImagePublicUrl).not.toHaveBeenCalled();
  });

  it("builds a post moderation DTO with persisted status and latest log fields", async () => {
    vi.mocked(getUsersByIds).mockResolvedValue({
      "post-author-101": {
        name: "Post Author One Hundred One",
        avatarMeta: postAuthorAvatarMeta,
      },
    });
    const latestLog = moderationLog({
      userId: "post-author-101",
      resourceId: "post-moderated-101",
      verdict: ModerationStatus.Approved,
      categories: ["persisted-log-category-101"],
      actionTaken: "FLAGGED_FOR_REVIEW",
      source: "ai",
      actorId: "moderator-actor-101",
      reasonSummary: "Post log summary 101",
      reasonDetails: "Post log details 101",
    });

    const [result] = await enricher.enrichPosts(
      [
        post({
          id: "post-moderated-101",
          userId: "post-author-101",
          moderationStatus: "quarantined",
          isPending: false,
          imageMeta: postImageMeta,
        }),
      ],
      { "post-moderated-101": latestLog },
    );

    expect(getUsersByIds).toHaveBeenCalledWith(["post-author-101"]);
    expect(result).toMatchObject({
      id: "post-moderated-101",
      userId: "post-author-101",
      userName: "Post Author One Hundred One",
      moderationStatus: "quarantined",
      flaggedReasons: ["persisted-log-category-101"],
      moderationInfo: {
        verdict: ModerationStatus.Approved,
        actionTaken: "FLAGGED_FOR_REVIEW",
        categories: ["persisted-log-category-101"],
        reasonSummary: "Post log summary 101",
        reasonDetails: "Post log details 101",
        source: "ai",
        actorId: "moderator-actor-101",
      },
    });
    expect(result.userAvatarUrl).toBe(imageUrlFor(postAuthorAvatarMeta));
    expect(result.imageUrl).toBe(imageUrlFor(postImageMeta));
  });

  it.each([
    {
      caseName: "pending entity state",
      isPending: true,
      latestLog: undefined,
      expected: "pending",
    },
    {
      caseName: "rejected latest verdict",
      isPending: false,
      latestLog: moderationLog({ verdict: ModerationStatus.Rejected }),
      expected: "rejected",
    },
    {
      caseName: "quarantine latest reason",
      isPending: false,
      latestLog: moderationLog({
        verdict: ModerationStatus.Approved,
        reasonSummary: "Provider quarantined the content",
      }),
      expected: "quarantined",
    },
    {
      caseName: "visible default",
      isPending: false,
      latestLog: undefined,
      expected: "visible",
    },
  ])(
    "derives the $expected fallback status from $caseName",
    async ({ isPending, latestLog, expected }) => {
      vi.mocked(getUsersByIds).mockResolvedValue({
        "fallback-author-111": { name: "Fallback Author 111" },
      });
      const postId = `post-fallback-${expected}`;

      const [result] = await enricher.enrichPosts(
        [
          post({
            id: postId,
            userId: "fallback-author-111",
            moderationStatus: undefined,
            isPending,
          }),
        ],
        latestLog ? { [postId]: latestLog } : {},
      );

      expect(result.moderationStatus).toBe(expected);
    },
  );

  it("keeps comment author, images, and parent post preview values distinct", async () => {
    vi.mocked(getUsersByIds).mockResolvedValue({
      "comment-author-202": {
        name: "Comment Author Two Hundred Two",
        avatarMeta: commentAuthorAvatarMeta,
      },
      "parent-author-303": {
        name: "Parent Author Three Hundred Three",
        avatarMeta: parentAuthorAvatarMeta,
      },
    });
    const latestLog = moderationLog({
      userId: "comment-author-202",
      resourceType: "comment",
      resourceId: "comment-moderated-202",
      verdict: ModerationStatus.Pending,
      categories: ["comment-log-category-202"],
      actionTaken: "FLAGGED_FOR_REVIEW",
      reasonSummary: "Comment log summary 202",
    });

    const [result] = await enricher.enrichComments(
      [
        comment({
          id: "comment-moderated-202",
          postId: "parent-post-303",
          userId: "comment-author-202",
          imageMeta: commentImageMeta,
        }),
      ],
      [
        post({
          id: "parent-post-303",
          userId: "parent-author-303",
          text: "Parent post preview text 303",
          imageMeta: parentPostImageMeta,
          isNSFW: false,
        }),
      ],
      { "comment-moderated-202": latestLog },
    );

    expect(getUsersByIds).toHaveBeenCalledWith([
      "comment-author-202",
      "parent-author-303",
    ]);
    expect(result).toMatchObject({
      id: "comment-moderated-202",
      userId: "comment-author-202",
      userName: "Comment Author Two Hundred Two",
      moderationStatus: "pending",
      flaggedReasons: ["comment-log-category-202"],
      parentPostPreview: {
        id: "parent-post-303",
        text: "Parent post preview text 303",
        userName: "Parent Author Three Hundred Three",
        hasImage: true,
        isNSFW: false,
      },
    });
    expect(result.userAvatarUrl).toBe(imageUrlFor(commentAuthorAvatarMeta));
    expect(result.imageUrl).toBe(imageUrlFor(commentImageMeta));
    expect(result.parentPostPreview?.userAvatarUrl).toBe(
      imageUrlFor(parentAuthorAvatarMeta),
    );
    expect(result.parentPostPreview?.imageUrl).toBe(
      imageUrlFor(parentPostImageMeta),
    );
  });

  it("omits the parent preview safely when the parent post is missing", async () => {
    vi.mocked(getUsersByIds).mockResolvedValue({
      "orphan-comment-author-404": { name: "Orphan Comment Author 404" },
    });

    const [result] = await enricher.enrichComments(
      [
        comment({
          id: "orphan-comment-404",
          postId: "missing-parent-post-404",
          userId: "orphan-comment-author-404",
        }),
      ],
      [],
      {},
    );

    expect(getUsersByIds).toHaveBeenCalledWith(["orphan-comment-author-404"]);
    expect(result.parentPostPreview).toBeUndefined();
  });

  it("uses the current Unknown fallback for missing comment and parent authors", async () => {
    vi.mocked(getUsersByIds).mockResolvedValue({});

    const [result] = await enricher.enrichComments(
      [
        comment({
          id: "comment-deleted-author-505",
          postId: "parent-deleted-author-606",
          userId: "missing-comment-author-505",
        }),
      ],
      [
        post({
          id: "parent-deleted-author-606",
          userId: "missing-parent-author-606",
        }),
      ],
      {},
    );

    expect(result.userName).toBe("Unknown");
    expect(result.userAvatarUrl).toBeNull();
    expect(result.parentPostPreview?.userName).toBe("Unknown");
    expect(result.parentPostPreview?.userAvatarUrl).toBeNull();
  });

  it("preserves post and comment output order", async () => {
    vi.mocked(getUsersByIds).mockResolvedValue({
      "order-author-701": { name: "Order Author 701" },
      "order-author-702": { name: "Order Author 702" },
      "order-author-703": { name: "Order Author 703" },
      "parent-order-author-704": { name: "Parent Order Author 704" },
    });

    const postResults = await enricher.enrichPosts(
      [
        post({ id: "post-order-first-701", userId: "order-author-701" }),
        post({ id: "post-order-second-702", userId: "order-author-702" }),
      ],
      {},
    );
    const commentResults = await enricher.enrichComments(
      [
        comment({
          id: "comment-order-first-703",
          postId: "parent-order-704",
          userId: "order-author-703",
        }),
        comment({
          id: "comment-order-second-702",
          postId: "parent-order-704",
          userId: "order-author-702",
        }),
      ],
      [
        post({
          id: "parent-order-704",
          userId: "parent-order-author-704",
        }),
      ],
      {},
    );

    expect(postResults.map(({ id }) => id)).toEqual([
      "post-order-first-701",
      "post-order-second-702",
    ]);
    expect(commentResults.map(({ id }) => id)).toEqual([
      "comment-order-first-703",
      "comment-order-second-702",
    ]);
  });

  it("propagates user lookup failures", async () => {
    vi.mocked(getUsersByIds).mockRejectedValueOnce(
      new Error("moderation users lookup failed"),
    );

    await expect(
      enricher.enrichPosts(
        [post({ id: "post-user-failure-801", userId: "author-failure-801" })],
        {},
      ),
    ).rejects.toThrow("moderation users lookup failed");
  });

  it("propagates image resolution failures", async () => {
    vi.mocked(getUsersByIds).mockResolvedValue({
      "image-failure-author-901": { name: "Image Failure Author 901" },
    });
    vi.mocked(resolveImagePublicUrl).mockImplementationOnce(() => {
      throw new Error("moderation image resolution failed");
    });

    await expect(
      enricher.enrichComments(
        [
          comment({
            id: "comment-image-failure-901",
            postId: "missing-parent-image-failure-901",
            userId: "image-failure-author-901",
            imageMeta: commentImageMeta,
          }),
        ],
        [],
        {},
      ),
    ).rejects.toThrow("moderation image resolution failed");
  });
});
