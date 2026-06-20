import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/activity/api/services", () => ({ logActivity: vi.fn() }));

import { UpdatePostUseCase } from "../use-cases/update-post.use-case";
import { DeletePostUseCase } from "../use-cases/delete-post.use-case";
import {
  createMockPost,
  createMockPostContentService,
  createMockPostEnricher,
  createMockPostModerationWorkflow,
  createMockPostRepository,
  createMockSession,
} from "./helpers/post-test.helpers";

const oldImage = {
  storageBucket: "bucket",
  storageLocation: "posts",
  fileName: "old.webp",
  downloadToken: "old-token",
  contentType: "image/webp",
  sizeBytes: 10,
};
const newImage = { ...oldImage, fileName: "new.webp", downloadToken: "new-token" };

describe("STORAGE-DELETE-ORDER-001", () => {
  const deleteImage = vi.fn(async () => undefined);

  beforeEach(() => vi.clearAllMocks());

  it("deletes the old replacement only after DB update commits", async () => {
    const repository = createMockPostRepository();
    vi.mocked(repository.getPostById).mockResolvedValue(
      createMockPost({ imageMeta: oldImage }),
    );
    vi.mocked(repository.updatePost).mockResolvedValue(
      createMockPost({ imageMeta: newImage }),
    );
    const content = createMockPostContentService();
    vi.mocked(content.process).mockResolvedValue({
      isPending: false,
      isNSFW: false,
      imageMeta: newImage,
    });
    const useCase = new UpdatePostUseCase(
      repository,
      content,
      createMockPostModerationWorkflow(),
      createMockPostEnricher({ enrichOne: vi.fn(async (post) => ({
        ...post,
        userName: "User",
        userAvatarUrl: null,
      })) }),
      deleteImage,
      createMockSession(),
    );
    await useCase.execute("post-1", { text: "updated" });
    expect(repository.updatePost).toHaveBeenCalled();
    expect(deleteImage).toHaveBeenCalledWith(oldImage);
    expect(vi.mocked(repository.updatePost).mock.invocationCallOrder[0]).toBeLessThan(
      deleteImage.mock.invocationCallOrder[0],
    );
  });

  it("does not delete current post media when DB delete fails", async () => {
    const repository = createMockPostRepository();
    vi.mocked(repository.getPostById).mockResolvedValue(
      createMockPost({ imageMeta: oldImage }),
    );
    vi.mocked(repository.deletePost).mockRejectedValue(new Error("db failed"));
    const useCase = new DeletePostUseCase(
      repository,
      deleteImage,
      vi.fn(async () => []),
      createMockSession(),
    );
    await expect(useCase.execute("post-1")).rejects.toThrow("db failed");
    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("deletes current media only after DB delete commits", async () => {
    const repository = createMockPostRepository();
    vi.mocked(repository.getPostById).mockResolvedValue(
      createMockPost({ imageMeta: oldImage }),
    );
    vi.mocked(repository.deletePost).mockResolvedValue(undefined);
    await new DeletePostUseCase(
      repository,
      deleteImage,
      vi.fn(async () => []),
      createMockSession(),
    ).execute("post-1");
    expect(vi.mocked(repository.deletePost).mock.invocationCallOrder[0]).toBeLessThan(
      deleteImage.mock.invocationCallOrder[0],
    );
  });
});
