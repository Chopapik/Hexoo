import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

import { logActivity } from "@/features/activity/api/services";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { SessionData } from "@/features/me/me.type";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type { PostContentService } from "@/features/posts/api/services/post.content.service";
import { UserRole } from "@/features/users/types/user.type";
import type { CommentRepository } from "../../repositories/comment.repository.interface";
import { AddCommentUseCase } from "../use-cases/add-comment.use-case";

type ProcessResult = Awaited<ReturnType<PostContentService["process"]>>;

const nowIso = "2026-07-06T12:13:14.000Z";

const session: SessionData = {
  uid: "comment-author-1",
  email: "comment-author@example.test",
  name: "Comment Author",
  role: UserRole.User,
};

const imageMeta: ImageMeta = {
  storageBucket: "comment-images",
  storageLocation: "comments/comment-author-1",
  fileName: "attached-comment.webp",
  downloadToken: "comment-download-token",
  contentType: "image/webp",
  sizeBytes: 34567,
};

const imageFile = new File(["comment-image-bytes"], "attached-comment.webp", {
  type: "image/webp",
});

const moderationPayload: NonNullable<
  ProcessResult["moderationLogPayloadForResource"]
> = {
  userId: "comment-author-1",
  timestamp: new Date("2026-07-06T08:09:10.000Z"),
  verdict: ModerationStatus.Pending,
  categories: ["toxicity"],
  actionTaken: "FLAGGED_FOR_REVIEW",
  source: "ai",
  actorId: "moderation-engine",
  reasonSummary: "Needs review",
  reasonDetails: "Matched risky phrasing",
  evidence: [
    {
      category: "toxicity",
      score: 0.91,
      sources: ["text"],
    },
  ],
};

function processed(overrides: Partial<ProcessResult> = {}): ProcessResult {
  return {
    isPending: false,
    isNSFW: false,
    imageMeta: null,
    ...overrides,
  };
}

function createRepository() {
  return {
    createComment: vi.fn(async () => "created-comment-1"),
  };
}

function createContentService() {
  return {
    process: vi.fn<PostContentService["process"]>().mockResolvedValue(
      processed(),
    ),
  };
}

function createUseCase({
  repository = createRepository(),
  contentService = createContentService(),
  currentSession = session,
  imageDeleter = vi.fn(async () => undefined),
}: {
  repository?: ReturnType<typeof createRepository>;
  contentService?: ReturnType<typeof createContentService>;
  currentSession?: SessionData | null;
  imageDeleter?: (meta: ImageMeta | null | undefined) => Promise<void>;
} = {}) {
  return {
    repository,
    contentService,
    imageDeleter,
    useCase: new AddCommentUseCase(
      repository as unknown as CommentRepository,
      contentService as unknown as PostContentService,
      currentSession,
      imageDeleter,
    ),
  };
}

async function expectCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toMatchObject({ code });
}

describe("AddCommentUseCase", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(nowIso));
    vi.clearAllMocks();
    vi.mocked(logActivity).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects a missing session before content, repository, activity, or cleanup work", async () => {
    const { useCase, repository, contentService, imageDeleter } = createUseCase({
      currentSession: null,
    });

    await expectCode(
      useCase.execute({
        postId: "post-auth-1",
        text: "Authenticated comment",
      }),
      "AUTH_REQUIRED",
    );

    expect(contentService.process).not.toHaveBeenCalled();
    expect(repository.createComment).not.toHaveBeenCalled();
    expect(logActivity).not.toHaveBeenCalled();
    expect(imageDeleter).not.toHaveBeenCalled();
  });

  it("rejects blank text with no image before write operations", async () => {
    const { useCase, repository, contentService, imageDeleter } = createUseCase();

    await expectCode(
      useCase.execute({
        postId: "post-validation-1",
        text: "   ",
      }),
      "VALIDATION_ERROR",
    );

    expect(contentService.process).not.toHaveBeenCalled();
    expect(repository.createComment).not.toHaveBeenCalled();
    expect(logActivity).not.toHaveBeenCalled();
    expect(imageDeleter).not.toHaveBeenCalled();
  });

  it("passes distinct user, text, resource, and image values to content processing", async () => {
    const { useCase, contentService } = createUseCase();

    await useCase.execute({
      postId: "post-processing-77",
      text: "  Comment text for processing  ",
      imageFile,
    });

    expect(contentService.process).toHaveBeenCalledWith(
      "comment-author-1",
      "  Comment text for processing  ",
      "comments",
      imageFile,
    );
  });

  it("creates the repository payload from processed moderation/image state and returns the response flags", async () => {
    const { useCase, repository, contentService } = createUseCase();
    vi.mocked(contentService.process).mockResolvedValueOnce(
      processed({
        isPending: true,
        isNSFW: true,
        imageMeta,
        moderationLogPayloadForResource: moderationPayload,
      }),
    );

    const result = await useCase.execute({
      postId: "post-create-200",
      text: "Distinct created comment",
      imageFile,
    });

    expect(repository.createComment).toHaveBeenCalledTimes(1);
    const [postId, payload] = repository.createComment.mock.calls[0];
    expect(postId).toBe("post-create-200");
    expect(payload).toMatchObject({
      postId: "post-create-200",
      userId: "comment-author-1",
      text: "Distinct created comment",
      likesCount: 0,
      commentsCount: 0,
      isPending: true,
      moderationStatus: "pending",
      isNSFW: true,
      isEdited: false,
      imageMeta,
      moderationContext: {
        timestamp: "2026-07-06T08:09:10.000Z",
        verdict: ModerationStatus.Pending,
        categories: ["toxicity"],
        actionTaken: "FLAGGED_FOR_REVIEW",
        source: "ai",
        actorId: "moderation-engine",
        reasonSummary: "Needs review",
        reasonDetails: "Matched risky phrasing",
        evidence: [
          {
            category: "toxicity",
            score: 0.91,
            sources: ["text"],
          },
        ],
      },
    });
    expect(payload.createdAt).toEqual(new Date(nowIso));
    expect(payload.updatedAt).toEqual(new Date(nowIso));
    expect(result).toEqual({
      isPending: true,
      isNSFW: true,
    });
  });

  it("logs activity only after the repository write succeeds", async () => {
    const { useCase, repository } = createUseCase();

    await useCase.execute({
      postId: "post-activity-1",
      text: "Activity comment",
    });

    expect(logActivity).toHaveBeenCalledWith(
      "comment-author-1",
      "COMMENT_ADDED",
      "User added a comment to post post-activity-1",
    );
    expect(repository.createComment.mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(logActivity).mock.invocationCallOrder[0],
    );
  });

  it("rolls back an uploaded image and skips activity when the repository write fails", async () => {
    const repository = createRepository();
    const contentService = createContentService();
    const imageDeleter = vi.fn(async () => undefined);
    vi.mocked(contentService.process).mockResolvedValueOnce(
      processed({ imageMeta }),
    );
    repository.createComment.mockRejectedValueOnce(new Error("db failed"));
    const { useCase } = createUseCase({
      repository,
      contentService,
      imageDeleter,
    });

    await expect(
      useCase.execute({
        postId: "post-rollback-1",
        text: "Rollback comment",
        imageFile,
      }),
    ).rejects.toThrow("db failed");

    expect(imageDeleter).toHaveBeenCalledWith(imageMeta);
    expect(logActivity).not.toHaveBeenCalled();
  });

  it("propagates activity failures after a successful repository write", async () => {
    const { useCase, repository, imageDeleter } = createUseCase();
    vi.mocked(logActivity).mockRejectedValueOnce(new Error("activity failed"));

    await expect(
      useCase.execute({
        postId: "post-activity-failure-1",
        text: "Activity failure comment",
      }),
    ).rejects.toThrow("activity failed");

    expect(repository.createComment).toHaveBeenCalledTimes(1);
    expect(imageDeleter).not.toHaveBeenCalled();
  });
});
