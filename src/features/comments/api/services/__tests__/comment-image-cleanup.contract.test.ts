import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/activity/api/services", () => ({ logActivity: vi.fn() }));

import { DeleteCommentUseCase } from "../use-cases/delete-comment.use-case";
import { DeletePostUseCase } from "@/features/posts/api/services/use-cases/delete-post.use-case";
import type { CommentRepository } from "../../repositories/comment.repository.interface";
import {
  createMockPost,
  createMockPostRepository,
  createMockSession,
} from "@/features/posts/api/services/__tests__/helpers/post-test.helpers";

const commentImage = {
  storageBucket: "bucket",
  storageLocation: "comments",
  fileName: "comment.webp",
  downloadToken: "token",
  contentType: "image/webp",
  sizeBytes: 10,
};

describe("STORAGE-COMMENT-CLEANUP-001", () => {
  const deleteImage = vi.fn(async () => undefined);

  beforeEach(() => vi.clearAllMocks());

  it("deletes a direct comment image only after DB deletion", async () => {
    const repository = {
      getCommentById: vi.fn().mockResolvedValue({
        id: "comment-1",
        postId: "post-1",
        userId: "user-1",
        text: "comment",
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        isPending: false,
        isNSFW: false,
        isEdited: false,
        imageMeta: commentImage,
      }),
      deleteComment: vi.fn().mockResolvedValue(undefined),
    } as unknown as CommentRepository;
    await new DeleteCommentUseCase(
      repository,
      deleteImage,
      createMockSession(),
    ).execute("comment-1");
    expect(deleteImage).toHaveBeenCalledWith(commentImage);
    expect(vi.mocked(repository.deleteComment).mock.invocationCallOrder[0]).toBeLessThan(
      deleteImage.mock.invocationCallOrder[0],
    );
  });

  it("retries an idempotent storage cleanup and keeps terminal failure visible", async () => {
    const repository = {
      getCommentById: vi.fn().mockResolvedValue({
        id: "comment-1",
        postId: "post-1",
        userId: "user-1",
        text: "comment",
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        isPending: false,
        isNSFW: false,
        isEdited: false,
        imageMeta: commentImage,
      }),
      deleteComment: vi.fn().mockResolvedValue(undefined),
    } as unknown as CommentRepository;
    const transientDelete = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValueOnce(undefined);
    await new DeleteCommentUseCase(
      repository,
      transientDelete,
      createMockSession(),
    ).execute("comment-1");
    expect(transientDelete).toHaveBeenCalledTimes(2);

    const terminalDelete = vi.fn().mockRejectedValue(new Error("storage failed"));
    await expect(
      new DeleteCommentUseCase(
        repository,
        terminalDelete,
        createMockSession(),
      ).execute("comment-1"),
    ).rejects.toThrow("storage failed");
    expect(terminalDelete).toHaveBeenCalledTimes(2);
  });

  it("collects comment image inventory before post cascade and cleans it after", async () => {
    const repository = createMockPostRepository();
    vi.mocked(repository.getPostById).mockResolvedValue(createMockPost());
    vi.mocked(repository.deletePost).mockResolvedValue(undefined);
    const inventory = vi.fn(async () => [commentImage]);
    await new DeletePostUseCase(
      repository,
      deleteImage,
      inventory,
      createMockSession(),
    ).execute("post-1");
    expect(inventory).toHaveBeenCalledBefore(vi.mocked(repository.deletePost));
    expect(deleteImage).toHaveBeenCalledWith(commentImage);
    expect(vi.mocked(repository.deletePost).mock.invocationCallOrder[0]).toBeLessThan(
      deleteImage.mock.invocationCallOrder[0],
    );
  });

  it("does not clean collected images when the post DB delete fails", async () => {
    const repository = createMockPostRepository();
    vi.mocked(repository.getPostById).mockResolvedValue(createMockPost());
    vi.mocked(repository.deletePost).mockRejectedValue(new Error("db failed"));
    await expect(
      new DeletePostUseCase(
        repository,
        deleteImage,
        vi.fn(async () => [commentImage]),
        createMockSession(),
      ).execute("post-1"),
    ).rejects.toThrow("db failed");
    expect(deleteImage).not.toHaveBeenCalled();
  });
});
