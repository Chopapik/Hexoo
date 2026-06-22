import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/users/api/services", () => ({
  getUsersByIds: vi.fn(async () => ({})),
}));
vi.mock("@/features/moderation/api/services/moderationLog.service", () => ({
  getModerationLogsForResource: vi.fn(async () => ({})),
}));
vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: vi.fn((meta: unknown) =>
    meta ? "https://storage.example.test/retained.webp" : null,
  ),
}));

import { PostEnricher } from "@/features/posts/api/services/post.enricher";
import { CommentEnricher } from "@/features/comments/api/services/comment.enricher";

const likes = {
  getLikesForParents: vi.fn(async () => []),
};

describe("Batch 7 tombstoned public authors", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders a retained post with a deleted author and retained media", async () => {
    const post = {
      id: "post-1",
      userId: "deleted-1",
      text: "retained post",
      imageMeta: {
        storageBucket: "media",
        storageLocation: "posts",
        fileName: "retained.webp",
        downloadToken: "token",
        contentType: "image/webp",
        sizeBytes: 100,
      },
    };

    const [result] = await new PostEnricher(likes as never).enrich(
      [post as never],
      null,
    );

    expect(result.userName).toBe("Deleted user");
    expect(result.userAvatarUrl).toBeNull();
    expect(result.imageMeta).toEqual(post.imageMeta);
  });

  it("renders a retained comment with a deleted author and retained media", async () => {
    const comment = {
      id: "comment-1",
      postId: "post-1",
      userId: "deleted-1",
      text: "retained comment",
      imageMeta: {
        storageBucket: "media",
        storageLocation: "comments",
        fileName: "retained.webp",
        downloadToken: "token",
        contentType: "image/webp",
        sizeBytes: 100,
      },
    };

    const [result] = await new CommentEnricher(likes as never).enrich(
      [comment as never],
      null,
    );

    expect(result.userName).toBe("Deleted user");
    expect(result.userAvatarUrl).toBeNull();
    expect(result.imageMeta).toEqual(comment.imageMeta);
  });
});
