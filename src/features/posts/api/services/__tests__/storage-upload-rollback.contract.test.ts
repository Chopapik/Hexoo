import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/activity/api/services", () => ({ logActivity: vi.fn() }));
vi.mock("@/features/images/api/image.service", () => ({ deleteImage: vi.fn() }));
vi.mock("@/features/moderation/api/services/moderationLog.service", () => ({
  logModerationEvent: vi.fn(),
}));

import { CreatePostUseCase } from "../use-cases/create-post.use-case";
import { UpdatePostUseCase } from "../use-cases/update-post.use-case";
import { AddCommentUseCase } from "@/features/comments/api/services/use-cases/add-comment.use-case";
import type { CommentRepository } from "@/features/comments/api/repositories/comment.repository.interface";
import {
  createMockPost,
  createMockPostContentService,
  createMockPostEnricher,
  createMockPostModerationWorkflow,
  createMockPostRepository,
  createMockSession,
} from "./helpers/post-test.helpers";

const newImage = {
  storageBucket: "bucket",
  storageLocation: "posts",
  fileName: "new.webp",
  downloadToken: "token",
  contentType: "image/webp",
  sizeBytes: 10,
};

describe("STORAGE-UPLOAD-ROLLBACK-001", () => {
  const deleteImage = vi.fn(async () => undefined);
  const content = createMockPostContentService();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(content.process).mockResolvedValue({
      isPending: false,
      isNSFW: false,
      imageMeta: newImage,
    });
  });

  it("deletes a post upload when insert fails", async () => {
    const repository = createMockPostRepository();
    vi.mocked(repository.createPost).mockRejectedValue(new Error("db failed"));
    const useCase = new CreatePostUseCase(
      repository,
      content,
      createMockPostModerationWorkflow(),
      createMockSession(),
      deleteImage,
    );
    await expect(
      useCase.execute({ text: "post", youtubeUrl: "" }),
    ).rejects.toThrow("db failed");
    expect(deleteImage).toHaveBeenCalledWith(newImage);
  });

  it("deletes a post upload when the atomic content/log write fails", async () => {
    const repository = createMockPostRepository();
    vi.mocked(repository.createPost).mockRejectedValue(
      new Error("log failed"),
    );
    const useCase = new CreatePostUseCase(
      repository,
      content,
      createMockPostModerationWorkflow(),
      createMockSession(),
      deleteImage,
    );
    await expect(
      useCase.execute({ text: "post", youtubeUrl: "" }),
    ).rejects.toThrow("log failed");
    expect(repository.deletePost).not.toHaveBeenCalled();
    expect(deleteImage).toHaveBeenCalledWith(newImage);
  });

  it("deletes a comment upload when insert fails", async () => {
    const repository = {
      createComment: vi.fn().mockRejectedValue(new Error("db failed")),
    } as unknown as CommentRepository;
    const useCase = new AddCommentUseCase(
      repository,
      content,
      createMockSession(),
      deleteImage,
    );
    await expect(
      useCase.execute({ text: "comment", postId: "post-1" }),
    ).rejects.toThrow("db failed");
    expect(deleteImage).toHaveBeenCalledWith(newImage);
  });

  it("deletes only the new replacement when post update fails", async () => {
    const oldImage = { ...newImage, fileName: "old.webp" };
    const repository = createMockPostRepository();
    vi.mocked(repository.getPostById).mockResolvedValue(
      createMockPost({ imageMeta: oldImage }),
    );
    vi.mocked(repository.updatePost).mockRejectedValue(new Error("db failed"));
    const useCase = new UpdatePostUseCase(
      repository,
      content,
      createMockPostModerationWorkflow(),
      createMockPostEnricher(),
      deleteImage,
      createMockSession(),
    );
    await expect(
      useCase.execute("post-1", { text: "updated" }),
    ).rejects.toThrow("db failed");
    expect(deleteImage).toHaveBeenCalledTimes(1);
    expect(deleteImage).toHaveBeenCalledWith(newImage);
    expect(deleteImage).not.toHaveBeenCalledWith(oldImage);
  });
});
