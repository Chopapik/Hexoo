import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

import { DeletePostUseCase } from "../use-cases/delete-post.use-case";
import {
  createMockPost,
  createMockPostRepository,
  createMockSession,
  expectAppError,
} from "./helpers/post-test.helpers";
import { logActivity } from "@/features/activity/api/services";

const imageDeleter = vi.fn();
const commentImageInventory = vi.fn(async () => []);

describe("DeletePostUseCase", () => {
  let repository: ReturnType<typeof createMockPostRepository>;
  let useCase: DeletePostUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = createMockPostRepository();
    useCase = new DeletePostUseCase(
      repository,
      imageDeleter,
      commentImageInventory,
      createMockSession(),
    );
    vi.mocked(logActivity).mockResolvedValue(undefined);
    vi.mocked(imageDeleter).mockResolvedValue(undefined);
  });

  it("throws AUTH_REQUIRED when no session", async () => {
    const noSession = new DeletePostUseCase(
      repository,
      imageDeleter,
      commentImageInventory,
      null,
    );
    await expectAppError(() => noSession.execute("post-1"), "AUTH_REQUIRED");
  });

  it("throws INVALID_INPUT for empty postId", async () => {
    await expectAppError(() => useCase.execute(""), "INVALID_INPUT");
  });

  it("throws NOT_FOUND when post does not exist", async () => {
    vi.mocked(repository.getPostById).mockResolvedValue(null);
    await expectAppError(() => useCase.execute("post-1"), "NOT_FOUND");
  });

  it("throws FORBIDDEN when user is not the author", async () => {
    vi.mocked(repository.getPostById).mockResolvedValue(
      createMockPost({ userId: "other-user" }),
    );
    await expectAppError(() => useCase.execute("post-1"), "FORBIDDEN");
  });

  it("deletes post, removes image, and logs activity", async () => {
    const imageMeta = {
      storageBucket: "b",
      storageLocation: "l",
      fileName: "f",
      downloadToken: "t",
      contentType: "image/png",
      sizeBytes: 100,
    };
    vi.mocked(repository.getPostById).mockResolvedValue(
      createMockPost({ userId: "user-1", imageMeta }),
    );

    await useCase.execute("post-1");

    expect(imageDeleter).toHaveBeenCalledWith(imageMeta);
    expect(repository.deletePost).toHaveBeenCalledWith("post-1");
    expect(logActivity).toHaveBeenCalledWith(
      "user-1",
      "POST_DELETED",
      expect.stringContaining("post-1"),
    );
  });

  it("propagates repository errors", async () => {
    vi.mocked(repository.getPostById).mockResolvedValue(
      createMockPost({ userId: "user-1" }),
    );
    vi.mocked(repository.deletePost).mockRejectedValue(new Error("db error"));
    await expect(useCase.execute("post-1")).rejects.toThrow("db error");
  });
});
