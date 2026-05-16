import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

import { UpdatePostUseCase } from "../use-cases/update-post.use-case";
import {
  createMockPost,
  createMockPostContentService,
  createMockPostEnricher,
  createMockPostModerationWorkflow,
  createMockPostRepository,
  createMockSession,
  expectAppError,
} from "./helpers/post-test.helpers";
import { logActivity } from "@/features/activity/api/services";

const imageDeleter = vi.fn(async () => undefined);

describe("UpdatePostUseCase", () => {
  let repository: ReturnType<typeof createMockPostRepository>;
  let contentService: ReturnType<typeof createMockPostContentService>;
  let moderationWorkflow: ReturnType<typeof createMockPostModerationWorkflow>;
  let enricher: ReturnType<typeof createMockPostEnricher>;
  let useCase: UpdatePostUseCase;
  const post = createMockPost({ id: "post-1", userId: "user-1", text: "Old" });
  const enriched = { ...post, userName: "Test User", userAvatarUrl: null };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = createMockPostRepository();
    contentService = createMockPostContentService();
    moderationWorkflow = createMockPostModerationWorkflow();
    enricher = createMockPostEnricher();
    useCase = new UpdatePostUseCase(
      repository,
      contentService,
      moderationWorkflow,
      enricher,
      imageDeleter,
      createMockSession(),
    );
    vi.mocked(repository.getPostById).mockResolvedValue(post);
    vi.mocked(moderationWorkflow.recordContentModerationResult).mockResolvedValue(
      undefined,
    );
    vi.mocked(enricher.enrichOne).mockResolvedValue(enriched);
    vi.mocked(logActivity).mockResolvedValue(undefined);
    vi.mocked(imageDeleter).mockResolvedValue(undefined);
  });

  it("throws AUTH_REQUIRED when no session", async () => {
    const noSession = new UpdatePostUseCase(
      repository,
      contentService,
      moderationWorkflow,
      enricher,
      imageDeleter,
      null,
    );
    await expectAppError(
      () => noSession.execute("post-1", { text: "Updated" }),
      "AUTH_REQUIRED",
    );
  });

  it("throws INVALID_INPUT for empty postId", async () => {
    await expectAppError(
      () => useCase.execute("", { text: "Updated" }),
      "INVALID_INPUT",
    );
  });

  it("throws NOT_FOUND when post does not exist", async () => {
    vi.mocked(repository.getPostById).mockResolvedValue(null);
    await expectAppError(
      () => useCase.execute("post-1", { text: "Updated" }),
      "NOT_FOUND",
    );
  });

  it("throws FORBIDDEN when user is not the author", async () => {
    vi.mocked(repository.getPostById).mockResolvedValue(
      createMockPost({ userId: "other-user" }),
    );
    await expectAppError(
      () => useCase.execute("post-1", { text: "Updated" }),
      "FORBIDDEN",
    );
  });

  it("updates post and returns enriched result", async () => {
    const updatedPost = createMockPost({
      id: "post-1",
      userId: "user-1",
      text: "Updated",
      isEdited: true,
    });
    vi.mocked(repository.getPostById)
      .mockResolvedValueOnce(post)
      .mockResolvedValueOnce(updatedPost);
    vi.mocked(enricher.enrichOne).mockResolvedValue({
      ...enriched,
      text: "Updated",
    });

    const result = await useCase.execute("post-1", { text: "Updated" });

    expect(repository.updatePost).toHaveBeenCalledWith(
      "post-1",
      expect.objectContaining({
        text: "Updated",
        isEdited: true,
      }),
    );
    expect(logActivity).toHaveBeenCalledWith(
      "user-1",
      "POST_UPDATED",
      expect.stringContaining("post-1"),
    );
    expect(result.text).toBe("Updated");
  });

  it("propagates repository errors", async () => {
    vi.mocked(repository.updatePost).mockRejectedValue(new Error("db error"));
    await expect(useCase.execute("post-1", { text: "Updated" })).rejects.toThrow(
      "db error",
    );
  });
});
