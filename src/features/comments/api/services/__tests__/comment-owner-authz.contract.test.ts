import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/activity/api/services", () => ({ logActivity: vi.fn() }));

import { AppError } from "@/lib/AppError";
import type { CommentRepository } from "../../repositories/comment.repository.interface";
import type { PostContentService } from "@/features/posts/api/services/post.content.service";
import type { CommentEnricher } from "../comment.enricher";
import { DeleteCommentUseCase } from "../use-cases/delete-comment.use-case";
import { UpdateCommentUseCase } from "../use-cases/update-comment.use-case";
import { UserRole } from "@/features/users/types/user.type";
import type { CommentEntity } from "../../../types/comment.entity";

const ownerSession = {
  uid: "owner-1",
  email: "owner@example.com",
  name: "Owner",
  role: UserRole.User,
};
const comment: CommentEntity = {
  id: "comment-1",
  postId: "post-1",
  userId: "owner-1",
  text: "original",
  likesCount: 0,
  commentsCount: 0,
  createdAt: new Date("2026-01-01"),
  isPending: false,
  isNSFW: false,
  isEdited: false,
};

function repositoryFor(row: CommentEntity | null): CommentRepository {
  return {
    getCommentById: vi.fn().mockResolvedValue(row),
    updateComment: vi.fn().mockResolvedValue({ ...comment, text: "updated" }),
    deleteComment: vi.fn().mockResolvedValue(undefined),
  } as unknown as CommentRepository;
}

const contentService = {
  process: vi.fn().mockResolvedValue({ isPending: false, isNSFW: false }),
} as unknown as PostContentService;
const enricher = {
  enrichOne: vi.fn(async (row: CommentEntity) => ({
    ...row,
    userName: "Owner",
    userAvatarUrl: null,
  })),
} as unknown as CommentEnricher;
const imageDeleter = vi.fn(async () => undefined);

async function expectCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toMatchObject({ code });
}

describe("comment owner authorization contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(["update", "delete"] as const)(
    "rejects a missing session for %s",
    async (operation) => {
      const repository = repositoryFor(comment);
      const promise =
        operation === "update"
          ? new UpdateCommentUseCase(repository, contentService, enricher, null).execute(
              "comment-1",
              { text: "updated" },
            )
          : new DeleteCommentUseCase(repository, imageDeleter, null).execute(
              "comment-1",
            );
      await expectCode(promise, "AUTH_REQUIRED");
    },
  );

  it.each(["update", "delete"] as const)(
    "prevents a non-owner from performing %s without a write",
    async (operation) => {
      const repository = repositoryFor({ ...comment, userId: "other-owner" });
      const promise =
        operation === "update"
          ? new UpdateCommentUseCase(
              repository,
              contentService,
              enricher,
              ownerSession,
            ).execute("comment-1", { text: "updated" })
          : new DeleteCommentUseCase(
              repository,
              imageDeleter,
              ownerSession,
            ).execute("comment-1");
      await expectCode(promise, "FORBIDDEN");
      expect(repository.updateComment).not.toHaveBeenCalled();
      expect(repository.deleteComment).not.toHaveBeenCalled();
    },
  );

  it("allows the owner to update and delete", async () => {
    const repository = repositoryFor(comment);
    await new UpdateCommentUseCase(
      repository,
      contentService,
      enricher,
      ownerSession,
    ).execute("comment-1", { text: "updated" });
    await new DeleteCommentUseCase(
      repository,
      imageDeleter,
      ownerSession,
    ).execute("comment-1");
    expect(repository.updateComment).toHaveBeenCalledTimes(1);
    expect(repository.deleteComment).toHaveBeenCalledWith("comment-1", "post-1");
  });

  it("uses controlled application errors", () => {
    expect(new AppError({ code: "FORBIDDEN" })).toMatchObject({ status: 403 });
  });
});
