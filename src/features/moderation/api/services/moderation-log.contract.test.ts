import { beforeEach, describe, expect, it, vi } from "vitest";

const services = vi.hoisted(() => ({ logActivity: vi.fn() }));

vi.mock("@/features/moderation/api/services/moderationLog.service", () => ({
  logModerationEvent: vi.fn(),
}));
vi.mock("@/features/activity/api/services", () => ({
  logActivity: services.logActivity,
}));

import type { CommentRepository } from "@/features/comments/api/repositories/comment.repository.interface";
import { AddCommentUseCase } from "@/features/comments/api/services/use-cases/add-comment.use-case";
import type { PostRepository } from "@/features/posts/api/repositories/post.repository.interface";
import type { PostContentService } from "@/features/posts/api/services/post.content.service";
import { PostModerationWorkflow } from "@/features/posts/api/services/post.moderation-workflow";
import { CreatePostUseCase } from "@/features/posts/api/services/use-cases/create-post.use-case";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { UserRole } from "@/features/users/types/user.type";
import { toModerationLogInsertRow } from "../repositories/moderationLog.supabase.mapper";

const session = {
  uid: "user-1",
  email: "user@example.com",
  name: "User",
  role: UserRole.User,
};
const evidence = [{ category: "hate", score: 0.8, sources: ["text" as const] }];
const pending = {
  isPending: true,
  isNSFW: false,
  imageMeta: null,
  moderationLogPayloadForResource: {
    userId: "user-1",
    verdict: ModerationStatus.Pending,
    categories: ["hate"],
    actionTaken: "FLAGGED_FOR_REVIEW" as const,
    source: "ai" as const,
    evidence,
  },
};
const deleteImage = vi.fn(async () => undefined);

describe("moderation log coherence contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    services.logActivity.mockResolvedValue(undefined);
  });

  it("passes AI-pending comment evidence in the atomic create payload", async () => {
    const repository = {
      createComment: vi.fn().mockResolvedValue("comment-1"),
      deleteComment: vi.fn(),
    } as unknown as CommentRepository;
    const contentService = {
      process: vi.fn().mockResolvedValue(pending),
    } as unknown as PostContentService;

    await new AddCommentUseCase(
      repository,
      contentService,
      session,
      deleteImage,
    ).execute({
      postId: "post-1",
      text: "comment",
    });

    expect(repository.createComment).toHaveBeenCalledWith(
      "post-1",
      expect.objectContaining({
        moderationStatus: "pending",
        moderationContext: expect.objectContaining({
          verdict: ModerationStatus.Pending,
          evidence,
        }),
      }),
    );
  });

  it("treats comment and moderation-log persistence as one failed write", async () => {
    const repository = {
      createComment: vi.fn().mockRejectedValue(new Error("log failed")),
      deleteComment: vi.fn().mockResolvedValue(undefined),
    } as unknown as CommentRepository;
    const contentService = {
      process: vi.fn().mockResolvedValue(pending),
    } as unknown as PostContentService;
    await expect(
      new AddCommentUseCase(
        repository,
        contentService,
        session,
        deleteImage,
      ).execute({
        postId: "post-1",
        text: "comment",
      }),
    ).rejects.toThrow("log failed");
    expect(repository.deleteComment).not.toHaveBeenCalled();
    expect(services.logActivity).not.toHaveBeenCalled();
  });

  it("treats post and moderation-log persistence as one failed write", async () => {
    const repository = {
      createPost: vi.fn().mockRejectedValue(new Error("log failed")),
      deletePost: vi.fn().mockResolvedValue(undefined),
    } as unknown as PostRepository;
    const contentService = {
      process: vi.fn().mockResolvedValue(pending),
    } as unknown as PostContentService;
    await expect(
      new CreatePostUseCase(
        repository,
        contentService,
        new PostModerationWorkflow(repository),
        session,
        deleteImage,
      ).execute({ text: "post", youtubeUrl: "" }),
    ).rejects.toThrow("log failed");
    expect(repository.deletePost).not.toHaveBeenCalled();
    expect(services.logActivity).not.toHaveBeenCalled();
  });

  it("stores structured evidence compatibly in reason_details", () => {
    const row = toModerationLogInsertRow({
      ...pending.moderationLogPayloadForResource,
      resourceType: "post",
      resourceId: "post-1",
      reasonDetails: "provider summary",
    });

    expect(JSON.parse(row.reason_details ?? "{}")).toEqual({
      summary: "provider summary",
      evidence,
    });
  });

  it("maps previous and new canonical status into the durable audit row", () => {
    const row = toModerationLogInsertRow({
      ...pending.moderationLogPayloadForResource,
      resourceType: "post",
      resourceId: "post-1",
      previousStatus: "visible",
      newStatus: "pending",
    });

    expect(row.previous_status).toBe("visible");
    expect(row.new_status).toBe("pending");
  });
});
