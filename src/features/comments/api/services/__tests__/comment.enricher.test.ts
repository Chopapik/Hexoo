import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/users/api/services", () => ({
  getUsersByIds: vi.fn(),
}));

vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: vi.fn(),
}));

import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { LikeRepository } from "@/features/likes/api/repositories";
import type { SessionData } from "@/features/me/me.type";
import { getUsersByIds } from "@/features/users/api/services";
import { UserRole } from "@/features/users/types/user.type";
import type { CommentEntity } from "../../../types/comment.entity";
import { CommentEnricher } from "../comment.enricher";

const session: SessionData = {
  uid: "session-user-900",
  email: "session-900@example.test",
  name: "Session Nine Hundred",
  role: UserRole.User,
};

const authorAvatarMeta: ImageMeta = {
  storageBucket: "avatars-bucket-distinct",
  storageLocation: "avatars/author-user-101",
  fileName: "author-avatar-101.webp",
  downloadToken: "avatar-token-101",
  contentType: "image/webp",
  sizeBytes: 10101,
};

const blankAuthorAvatarMeta: ImageMeta = {
  storageBucket: "avatars-bucket-blank",
  storageLocation: "avatars/blank-author-202",
  fileName: "blank-author-avatar-202.webp",
  downloadToken: "avatar-token-202",
  contentType: "image/webp",
  sizeBytes: 20202,
};

const commentImageMeta: ImageMeta = {
  storageBucket: "comment-images-bucket-distinct",
  storageLocation: "comments/comment-303",
  fileName: "comment-image-303.webp",
  downloadToken: "comment-image-token-303",
  contentType: "image/webp",
  sizeBytes: 30303,
};

function createLikeRepository(): LikeRepository {
  return {
    setLikeState: vi.fn(),
    getLikesForParents: vi.fn(async () => []),
  };
}

function createEnricher(repository = createLikeRepository()) {
  return {
    repository,
    enricher: new CommentEnricher(repository),
  };
}

function comment(overrides: Partial<CommentEntity> = {}): CommentEntity {
  return {
    id: "comment-base-001",
    postId: "post-base-001",
    userId: "author-base-001",
    text: "Base comment text",
    likesCount: 4,
    commentsCount: 0,
    createdAt: new Date("2026-07-09T08:00:00.000Z"),
    updatedAt: new Date("2026-07-09T08:01:00.000Z"),
    isPending: false,
    moderationStatus: "visible",
    isNSFW: false,
    isEdited: false,
    imageMeta: null,
    ...overrides,
  };
}

function imageUrlFor(meta: ImageMeta | null | undefined): string | null {
  if (!meta) return null;
  return `resolved://${meta.storageBucket}/${meta.storageLocation}/${meta.fileName}`;
}

describe("CommentEnricher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUsersByIds).mockResolvedValue({});
    vi.mocked(resolveImagePublicUrl).mockImplementation(imageUrlFor);
  });

  it("returns an empty array for empty input without calling dependencies", async () => {
    const { enricher, repository } = createEnricher();

    await expect(enricher.enrich([], session)).resolves.toEqual([]);

    expect(getUsersByIds).not.toHaveBeenCalled();
    expect(repository.getLikesForParents).not.toHaveBeenCalled();
    expect(resolveImagePublicUrl).not.toHaveBeenCalled();
  });

  it("skips likes lookup for logged-out enrichment", async () => {
    const { enricher, repository } = createEnricher();
    vi.mocked(getUsersByIds).mockResolvedValue({
      "comment-author-111": { name: "Logged Out Author", avatarMeta: null },
    });

    const [result] = await enricher.enrich(
      [
        comment({
          id: "comment-logged-out-111",
          postId: "post-logged-out-222",
          userId: "comment-author-111",
        }),
      ],
      null,
    );

    expect(getUsersByIds).toHaveBeenCalledWith(["comment-author-111"]);
    expect(repository.getLikesForParents).not.toHaveBeenCalled();
    expect(result.isLikedByMe).toBe(false);
    expect(result.userName).toBe("Logged Out Author");
  });

  it("loads likes for the logged-in session and comments parent collection", async () => {
    const { enricher, repository } = createEnricher();
    vi.mocked(getUsersByIds).mockResolvedValue({
      "comment-author-121": { name: "First Author", avatarMeta: null },
      "comment-author-122": { name: "Second Author", avatarMeta: null },
    });
    vi.mocked(repository.getLikesForParents).mockResolvedValue([
      "comment-like-target-122",
    ]);

    const results = await enricher.enrich(
      [
        comment({
          id: "comment-like-target-121",
          postId: "post-like-parent-321",
          userId: "comment-author-121",
        }),
        comment({
          id: "comment-like-target-122",
          postId: "post-like-parent-322",
          userId: "comment-author-122",
        }),
      ],
      session,
    );

    expect(repository.getLikesForParents).toHaveBeenCalledWith(
      "session-user-900",
      "comments",
      ["comment-like-target-121", "comment-like-target-122"],
    );
    expect(results.map((result) => result.isLikedByMe)).toEqual([false, true]);
  });

  it("uses Deleted user for missing authors", async () => {
    const { enricher } = createEnricher();
    vi.mocked(getUsersByIds).mockResolvedValue({});

    const [result] = await enricher.enrich(
      [
        comment({
          id: "comment-missing-author-131",
          postId: "post-missing-author-231",
          userId: "missing-author-331",
        }),
      ],
      null,
    );

    expect(result.userName).toBe("Deleted user");
    expect(result.userAvatarUrl).toBeNull();
  });

  it("uses Deleted user for blank author names without leaking the avatar", async () => {
    const { enricher } = createEnricher();
    vi.mocked(getUsersByIds).mockResolvedValue({
      "blank-author-202": {
        name: "   ",
        avatarMeta: blankAuthorAvatarMeta,
      },
    });

    const [result] = await enricher.enrich(
      [
        comment({
          id: "comment-blank-author-141",
          postId: "post-blank-author-241",
          userId: "blank-author-202",
        }),
      ],
      null,
    );

    expect(result.userName).toBe("Deleted user");
    expect(result.userAvatarUrl).toBeNull();
    expect(resolveImagePublicUrl).not.toHaveBeenCalledWith(
      blankAuthorAvatarMeta,
    );
  });

  it("resolves named author avatars through the image URL helper", async () => {
    const { enricher } = createEnricher();
    vi.mocked(getUsersByIds).mockResolvedValue({
      "named-author-101": {
        name: "Named Avatar Author",
        avatarMeta: authorAvatarMeta,
      },
    });

    const [result] = await enricher.enrich(
      [
        comment({
          id: "comment-named-author-151",
          postId: "post-named-author-251",
          userId: "named-author-101",
        }),
      ],
      null,
    );

    expect(resolveImagePublicUrl).toHaveBeenCalledWith(authorAvatarMeta);
    expect(result.userAvatarUrl).toBe(
      "resolved://avatars-bucket-distinct/avatars/author-user-101/author-avatar-101.webp",
    );
  });

  it("resolves comment image metadata to imageUrl", async () => {
    const { enricher } = createEnricher();
    vi.mocked(getUsersByIds).mockResolvedValue({
      "image-author-303": { name: "Image Author", avatarMeta: null },
    });

    const [result] = await enricher.enrich(
      [
        comment({
          id: "comment-with-image-161",
          postId: "post-with-image-261",
          userId: "image-author-303",
          imageMeta: commentImageMeta,
        }),
      ],
      null,
    );

    expect(resolveImagePublicUrl).toHaveBeenCalledWith(commentImageMeta);
    expect(result.imageUrl).toBe(
      "resolved://comment-images-bucket-distinct/comments/comment-303/comment-image-303.webp",
    );
  });

  it("preserves output order", async () => {
    const { enricher } = createEnricher();
    vi.mocked(getUsersByIds).mockResolvedValue({
      "order-author-401": { name: "Order Author One", avatarMeta: null },
      "order-author-402": { name: "Order Author Two", avatarMeta: null },
      "order-author-403": { name: "Order Author Three", avatarMeta: null },
    });

    const results = await enricher.enrich(
      [
        comment({
          id: "comment-order-first-401",
          postId: "post-order-501",
          userId: "order-author-401",
        }),
        comment({
          id: "comment-order-second-402",
          postId: "post-order-502",
          userId: "order-author-402",
        }),
        comment({
          id: "comment-order-third-403",
          postId: "post-order-503",
          userId: "order-author-403",
        }),
      ],
      null,
    );

    expect(results.map((result) => result.id)).toEqual([
      "comment-order-first-401",
      "comment-order-second-402",
      "comment-order-third-403",
    ]);
    expect(results.map((result) => result.userName)).toEqual([
      "Order Author One",
      "Order Author Two",
      "Order Author Three",
    ]);
  });

  it("does not confuse the comment author with the current session user", async () => {
    const { enricher, repository } = createEnricher();
    vi.mocked(getUsersByIds).mockResolvedValue({
      "comment-author-distinct-701": {
        name: "Comment Author Seven",
        avatarMeta: authorAvatarMeta,
      },
      "session-user-900": {
        name: "Wrong Session User Name",
        avatarMeta: blankAuthorAvatarMeta,
      },
    });
    vi.mocked(repository.getLikesForParents).mockResolvedValue([
      "comment-author-session-check-601",
    ]);

    const [result] = await enricher.enrich(
      [
        comment({
          id: "comment-author-session-check-601",
          postId: "post-author-session-check-801",
          userId: "comment-author-distinct-701",
        }),
      ],
      session,
    );

    expect(getUsersByIds).toHaveBeenCalledWith([
      "comment-author-distinct-701",
    ]);
    expect(repository.getLikesForParents).toHaveBeenCalledWith(
      "session-user-900",
      "comments",
      ["comment-author-session-check-601"],
    );
    expect(result.userName).toBe("Comment Author Seven");
    expect(result.userAvatarUrl).toBe(
      "resolved://avatars-bucket-distinct/avatars/author-user-101/author-avatar-101.webp",
    );
    expect(result.isLikedByMe).toBe(true);
  });

  it("propagates dependency failures", async () => {
    const { enricher } = createEnricher();
    vi.mocked(getUsersByIds).mockRejectedValueOnce(
      new Error("users lookup failed"),
    );

    await expect(
      enricher.enrich(
        [
          comment({
            id: "comment-dependency-failure-901",
            postId: "post-dependency-failure-902",
            userId: "author-dependency-failure-903",
          }),
        ],
        null,
      ),
    ).rejects.toThrow("users lookup failed");
  });
});
