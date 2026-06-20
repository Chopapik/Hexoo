import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

import { CreatePostUseCase } from "../use-cases/create-post.use-case";
import {
  createMockPostContentService,
  createMockPostModerationWorkflow,
  createMockPostRepository,
  createMockSession,
  createRestrictedSession,
  expectAppError,
} from "./helpers/post-test.helpers";
import { logActivity } from "@/features/activity/api/services";

const imageDeleter = vi.fn(async () => undefined);

describe("CreatePostUseCase", () => {
  let repository: ReturnType<typeof createMockPostRepository>;
  let contentService: ReturnType<typeof createMockPostContentService>;
  let moderationWorkflow: ReturnType<typeof createMockPostModerationWorkflow>;
  let useCase: CreatePostUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = createMockPostRepository();
    contentService = createMockPostContentService();
    moderationWorkflow = createMockPostModerationWorkflow();
    useCase = new CreatePostUseCase(
      repository,
      contentService,
      moderationWorkflow,
      createMockSession(),
      imageDeleter,
    );
    vi.mocked(repository.createPost).mockResolvedValue("new-post-id");
    vi.mocked(moderationWorkflow.recordContentModerationResult).mockResolvedValue(
      undefined,
    );
    vi.mocked(logActivity).mockResolvedValue(undefined);
  });

  it("throws AUTH_REQUIRED when no session", async () => {
    const noSession = new CreatePostUseCase(
      repository,
      contentService,
      moderationWorkflow,
      null,
      imageDeleter,
    );
    await expectAppError(
      () => noSession.execute({ text: "hello", youtubeUrl: "" }),
      "AUTH_REQUIRED",
    );
  });

  it("throws FORBIDDEN when user is restricted", async () => {
    const restricted = new CreatePostUseCase(
      repository,
      contentService,
      moderationWorkflow,
      createRestrictedSession(),
      imageDeleter,
    );
    await expectAppError(
      () => restricted.execute({ text: "hello", youtubeUrl: "" }),
      "FORBIDDEN",
    );
  });

  it("throws VALIDATION_ERROR for empty text with no image", async () => {
    await expectAppError(
      () => useCase.execute({ text: "", youtubeUrl: "" }),
      "VALIDATION_ERROR",
    );
    expect(repository.createPost).not.toHaveBeenCalled();
  });

  it("creates post and logs activity on success", async () => {
    const result = await useCase.execute({
      text: "Hello world!",
      youtubeUrl: "",
    });

    expect(repository.createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        text: "Hello world!",
      }),
    );
    expect(logActivity).toHaveBeenCalledWith(
      "user-1",
      "POST_CREATED",
      expect.any(String),
    );
    expect(result).toEqual({
      postId: "new-post-id",
      isPending: false,
      isNSFW: false,
    });
  });

  it("propagates repository errors", async () => {
    vi.mocked(repository.createPost).mockRejectedValue(new Error("db error"));
    await expect(
      useCase.execute({ text: "Hello world!", youtubeUrl: "" }),
    ).rejects.toThrow("db error");
  });
});
