import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/activity/api/services", () => ({ logActivity: vi.fn() }));

import { DeletePostUseCase } from "../use-cases/delete-post.use-case";
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

describe("post owner authorization contract", () => {
  const imageDeleter = vi.fn();
  const ownerPost = createMockPost({ id: "post-1", userId: "user-1" });

  beforeEach(() => vi.clearAllMocks());

  it.each(["update", "delete"] as const)(
    "rejects a missing session for %s",
    async (operation) => {
      const repository = createMockPostRepository();
      if (operation === "update") {
        const useCase = new UpdatePostUseCase(
          repository,
          createMockPostContentService(),
          createMockPostModerationWorkflow(),
          createMockPostEnricher(),
          imageDeleter,
          null,
        );
        await expectAppError(
          () => useCase.execute("post-1", { text: "updated" }),
          "AUTH_REQUIRED",
        );
      } else {
        await expectAppError(
          () => new DeletePostUseCase(repository, imageDeleter, null).execute("post-1"),
          "AUTH_REQUIRED",
        );
      }
    },
  );

  it.each(["update", "delete"] as const)(
    "prevents a non-owner from performing %s without a write",
    async (operation) => {
      const repository = createMockPostRepository();
      vi.mocked(repository.getPostById).mockResolvedValue(
        createMockPost({ id: "post-1", userId: "another-user" }),
      );

      if (operation === "update") {
        const useCase = new UpdatePostUseCase(
          repository,
          createMockPostContentService(),
          createMockPostModerationWorkflow(),
          createMockPostEnricher(),
          imageDeleter,
          createMockSession(),
        );
        await expectAppError(
          () => useCase.execute("post-1", { text: "updated" }),
          "FORBIDDEN",
        );
        expect(repository.updatePost).not.toHaveBeenCalled();
      } else {
        await expectAppError(
          () =>
            new DeletePostUseCase(
              repository,
              imageDeleter,
              createMockSession(),
            ).execute("post-1"),
          "FORBIDDEN",
        );
        expect(repository.deletePost).not.toHaveBeenCalled();
      }
    },
  );

  it("allows the owner to update and delete", async () => {
    const repository = createMockPostRepository();
    vi.mocked(repository.getPostById).mockResolvedValue(ownerPost);
    vi.mocked(repository.updatePost).mockResolvedValue({
      ...ownerPost,
      text: "updated",
      isEdited: true,
    });
    const enricher = createMockPostEnricher();
    vi.mocked(enricher.enrichOne).mockResolvedValue({
      ...ownerPost,
      text: "updated",
      userName: "Owner",
      userAvatarUrl: null,
    });

    await new UpdatePostUseCase(
      repository,
      createMockPostContentService(),
      createMockPostModerationWorkflow(),
      enricher,
      imageDeleter,
      createMockSession(),
    ).execute("post-1", { text: "updated" });
    await new DeletePostUseCase(
      repository,
      imageDeleter,
      createMockSession(),
    ).execute("post-1");

    expect(repository.updatePost).toHaveBeenCalledTimes(1);
    expect(repository.deletePost).toHaveBeenCalledWith("post-1");
  });
});
