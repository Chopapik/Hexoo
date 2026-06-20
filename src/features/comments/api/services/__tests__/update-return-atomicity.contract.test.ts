import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/activity/api/services", () => ({ logActivity: vi.fn() }));

import type { CommentRepository } from "../../repositories/comment.repository.interface";
import type { CommentEntity } from "../../../types/comment.entity";
import type { PostContentService } from "@/features/posts/api/services/post.content.service";
import type { CommentEnricher } from "../comment.enricher";
import { UpdateCommentUseCase } from "../use-cases/update-comment.use-case";
import { UserRole } from "@/features/users/types/user.type";

const original: CommentEntity = {
  id: "comment-1",
  postId: "post-1",
  userId: "user-1",
  text: "before",
  likesCount: 0,
  commentsCount: 0,
  createdAt: new Date("2026-01-01"),
  isPending: false,
  isNSFW: false,
  isEdited: false,
};

describe("comment update return atomicity contract", () => {
  it("uses the authoritative row returned by update without a second read", async () => {
    const updated = { ...original, text: "after", isEdited: true };
    const repository = {
      getCommentById: vi.fn().mockResolvedValueOnce(original),
      updateComment: vi.fn().mockResolvedValue(updated),
    } as unknown as CommentRepository;
    const contentService = {
      process: vi.fn().mockResolvedValue({ isPending: false, isNSFW: false }),
    } as unknown as PostContentService;
    const enricher = {
      enrichOne: vi.fn(async (row: CommentEntity) => ({
        ...row,
        userName: "User",
        userAvatarUrl: null,
      })),
    } as unknown as CommentEnricher;
    const session = {
      uid: "user-1",
      email: "user@example.com",
      name: "User",
      role: UserRole.User,
    };

    const result = await new UpdateCommentUseCase(
      repository,
      contentService,
      enricher,
      session,
    ).execute("comment-1", { text: "after" });

    expect(result.text).toBe("after");
    expect(repository.getCommentById).toHaveBeenCalledTimes(1);
    expect(enricher.enrichOne).toHaveBeenCalledWith(updated, session);
  });
});
