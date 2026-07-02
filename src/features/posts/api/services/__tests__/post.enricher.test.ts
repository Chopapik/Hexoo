import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { LikeRepository } from "@/features/likes/api/repositories";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { UserRole } from "@/features/users/types/user.type";
import { PostEnricher } from "../post.enricher";
import {
  createMockPost,
  createMockSession,
} from "./helpers/post-test.helpers";

const mocks = vi.hoisted(() => ({
  getUsersByIds: vi.fn(),
  getModerationLogsForResource: vi.fn(),
  resolveImagePublicUrl: vi.fn(),
}));

vi.mock("@/features/users/api/services", () => ({
  getUsersByIds: mocks.getUsersByIds,
}));

vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: mocks.resolveImagePublicUrl,
}));

vi.mock("@/features/moderation/api/services/moderationLog.service", () => ({
  getModerationLogsForResource: mocks.getModerationLogsForResource,
}));

const postImageMeta: ImageMeta = {
  storageBucket: "post-images",
  storageLocation: "posts/user-1",
  fileName: "post.webp",
  downloadToken: "post-token",
  contentType: "image/webp",
  sizeBytes: 12345,
};

const avatarMeta: ImageMeta = {
  storageBucket: "avatars",
  storageLocation: "avatars/user-1",
  fileName: "avatar.webp",
  downloadToken: "avatar-token",
  contentType: "image/webp",
  sizeBytes: 54321,
};

function createFakeLikeRepository(): LikeRepository {
  return {
    setLikeState: vi.fn<LikeRepository["setLikeState"]>(),
    getLikesForParents: vi
      .fn<LikeRepository["getLikesForParents"]>()
      .mockResolvedValue([]),
  };
}

describe("PostEnricher", () => {
  let likeRepository: LikeRepository;
  let enricher: PostEnricher;

  beforeEach(() => {
    vi.clearAllMocks();

    likeRepository = createFakeLikeRepository();
    enricher = new PostEnricher(likeRepository);

    mocks.getUsersByIds.mockResolvedValue({
      "user-1": { name: "Alice Author", avatarMeta },
    });
    mocks.getModerationLogsForResource.mockResolvedValue({});
    mocks.resolveImagePublicUrl.mockImplementation(
      (meta: ImageMeta | null | undefined) => {
        if (!meta) return null;
        if (meta.fileName === postImageMeta.fileName) {
          return "https://cdn.example.com/post.webp";
        }
        if (meta.fileName === avatarMeta.fileName) {
          return "https://cdn.example.com/avatar.webp";
        }
        return "https://cdn.example.com/unknown.webp";
      },
    );
  });

  it("returns an empty array without dependency calls", async () => {
    const result = await enricher.enrich([], createMockSession());

    expect(result).toEqual([]);
    expect(mocks.getUsersByIds).not.toHaveBeenCalled();
    expect(likeRepository.getLikesForParents).not.toHaveBeenCalled();
    expect(mocks.getModerationLogsForResource).not.toHaveBeenCalled();
    expect(mocks.resolveImagePublicUrl).not.toHaveBeenCalled();
  });

  it("skips liked-state and moderation lookups for logged-out enrichment", async () => {
    const post = createMockPost({ id: "post-1", userId: "user-1" });

    const [result] = await enricher.enrich([post], null);

    expect(mocks.getUsersByIds).toHaveBeenCalledWith(["user-1"]);
    expect(likeRepository.getLikesForParents).not.toHaveBeenCalled();
    expect(mocks.getModerationLogsForResource).not.toHaveBeenCalled();
    expect(result.isLikedByMe).toBe(false);
    expect(result.moderationInfo).toBeUndefined();
  });

  it("loads liked state for logged-in enrichment", async () => {
    vi.mocked(likeRepository.getLikesForParents).mockResolvedValue(["post-1"]);

    const post = createMockPost({ id: "post-1", userId: "user-1" });
    const session = createMockSession(UserRole.User, { uid: "viewer-1" });

    const [result] = await enricher.enrich([post], session);

    expect(likeRepository.getLikesForParents).toHaveBeenCalledWith(
      "viewer-1",
      "posts",
      ["post-1"],
    );
    expect(result.isLikedByMe).toBe(true);
  });

  it("exposes moderationInfo for the owner's own post", async () => {
    mocks.getModerationLogsForResource.mockResolvedValue({
      "post-1": {
        userId: "user-1",
        verdict: ModerationStatus.Pending,
        actionTaken: "FLAGGED_FOR_REVIEW",
        categories: ["violence"],
        reasonSummary: "Needs review",
        reasonDetails: "Detected risky content",
        source: "ai",
        actorId: "moderator-1",
      },
    });

    const post = createMockPost({ id: "post-1", userId: "user-1" });
    const session = createMockSession(UserRole.User, { uid: "user-1" });

    const [result] = await enricher.enrich([post], session);

    expect(mocks.getModerationLogsForResource).toHaveBeenCalledWith("post", [
      "post-1",
    ]);
    expect(result.moderationInfo).toEqual({
      verdict: ModerationStatus.Pending,
      actionTaken: "FLAGGED_FOR_REVIEW",
      categories: ["violence"],
      reasonSummary: "Needs review",
      reasonDetails: "Detected risky content",
    });
  });

  it("does not expose moderationInfo to non-owners", async () => {
    const post = createMockPost({ id: "post-1", userId: "user-1" });
    const session = createMockSession(UserRole.User, { uid: "viewer-1" });

    const [result] = await enricher.enrich([post], session);

    expect(mocks.getModerationLogsForResource).not.toHaveBeenCalled();
    expect(result.moderationInfo).toBeUndefined();
  });

  it.each([
    ["missing author", {}],
    ["blank author name", { "user-1": { name: "   ", avatarMeta } }],
  ])("uses Deleted user fallback for %s", async (_caseName, authors) => {
    mocks.getUsersByIds.mockResolvedValue(authors);

    const post = createMockPost({ id: "post-1", userId: "user-1" });

    const [result] = await enricher.enrich([post], null);

    expect(result.userName).toBe("Deleted user");
    expect(result.userAvatarUrl).toBeNull();
  });

  it("maps a missing author avatar to null", async () => {
    mocks.getUsersByIds.mockResolvedValue({
      "user-1": { name: "Alice Author" },
    });

    const post = createMockPost({ id: "post-1", userId: "user-1" });

    const [result] = await enricher.enrich([post], null);

    expect(result.userName).toBe("Alice Author");
    expect(result.userAvatarUrl).toBeNull();
  });

  it("keeps an existing post imageUrl instead of resolving image metadata", async () => {
    mocks.getUsersByIds.mockResolvedValue({
      "user-1": { name: "Alice Author" },
    });

    const post = createMockPost({
      id: "post-1",
      userId: "user-1",
      imageMeta: postImageMeta,
      imageUrl: "https://existing.example.com/post.webp",
    });

    const [result] = await enricher.enrich([post], null);

    expect(result.imageUrl).toBe("https://existing.example.com/post.webp");
    expect(mocks.resolveImagePublicUrl).not.toHaveBeenCalledWith(
      postImageMeta,
    );
  });

  it("resolves image metadata to a public image URL when imageUrl is missing", async () => {
    const post = createMockPost({
      id: "post-1",
      userId: "user-1",
      imageMeta: postImageMeta,
      imageUrl: null,
    });

    const [result] = await enricher.enrich([post], null);

    expect(mocks.resolveImagePublicUrl).toHaveBeenCalledWith(postImageMeta);
    expect(result.imageUrl).toBe("https://cdn.example.com/post.webp");
  });

  it("enrichOne returns the enriched single post", async () => {
    const post = createMockPost({ id: "post-1", userId: "user-1" });

    const result = await enricher.enrichOne(post, null);

    expect(result.id).toBe("post-1");
    expect(result.userName).toBe("Alice Author");
    expect(result.userAvatarUrl).toBe("https://cdn.example.com/avatar.webp");
  });
});
