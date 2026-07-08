import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "@/features/me/me.type";
import type { PostContentService } from "@/features/posts/api/services/post.content.service";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { UserRole } from "@/features/users/types/user.type";
import type { CommentRepository } from "../../repositories/comment.repository.interface";
import type { CommentEntity } from "../../../types/comment.entity";
import type { PublicCommentResponseDto } from "../../../types/comment.dto";
import type { CommentEnricher } from "../comment.enricher";
import { UpdateCommentUseCase } from "../use-cases/update-comment.use-case";

type ProcessResult = Awaited<ReturnType<PostContentService["process"]>>;

const nowIso = "2026-07-08T09:10:11.000Z";

const session: SessionData = {
  uid: "editor-user-17",
  email: "editor-17@example.test",
  name: "Editor Seventeen",
  role: UserRole.User,
};

const originalComment: CommentEntity = {
  id: "comment-before-42",
  postId: "post-parent-84",
  userId: "editor-user-17",
  text: "Original persisted comment",
  likesCount: 12,
  commentsCount: 3,
  createdAt: new Date("2026-07-01T01:02:03.000Z"),
  updatedAt: new Date("2026-07-02T04:05:06.000Z"),
  isPending: false,
  moderationStatus: "visible",
  isNSFW: false,
  isEdited: false,
};

const updatedComment: CommentEntity = {
  ...originalComment,
  text: "Repository returned edited comment",
  updatedAt: new Date(nowIso),
  isPending: true,
  moderationStatus: "pending",
  isNSFW: true,
  isEdited: true,
};

const enrichedUpdatedComment: PublicCommentResponseDto = {
  ...updatedComment,
  userName: "Enriched Editor",
  userAvatarUrl: "https://cdn.example.test/avatar.webp",
  imageUrl: null,
  isLikedByMe: true,
};

const moderationPayload: NonNullable<
  ProcessResult["moderationLogPayloadForResource"]
> = {
  userId: "editor-user-17",
  timestamp: new Date("2026-07-08T06:07:08.000Z"),
  verdict: ModerationStatus.Pending,
  categories: ["harassment", "toxicity"],
  actionTaken: "FLAGGED_FOR_REVIEW",
  source: "ai",
  actorId: "comment-moderator-bot",
  reasonSummary: "Needs human review",
  reasonDetails: "Distinct risky edit details",
  evidence: [
    {
      category: "toxicity",
      score: 0.82,
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
    getCommentById: vi.fn(async () => originalComment),
    updateComment: vi.fn(async () => updatedComment),
  };
}

function createContentService() {
  return {
    process: vi.fn<PostContentService["process"]>().mockResolvedValue(
      processed(),
    ),
  };
}

function createEnricher() {
  return {
    enrichOne: vi.fn(async () => enrichedUpdatedComment),
  };
}

function createUseCase({
  repository = createRepository(),
  contentService = createContentService(),
  enricher = createEnricher(),
  currentSession = session,
}: {
  repository?: ReturnType<typeof createRepository>;
  contentService?: ReturnType<typeof createContentService>;
  enricher?: ReturnType<typeof createEnricher>;
  currentSession?: SessionData | null;
} = {}) {
  return {
    repository,
    contentService,
    enricher,
    useCase: new UpdateCommentUseCase(
      repository as unknown as CommentRepository,
      contentService as unknown as PostContentService,
      enricher as unknown as CommentEnricher,
      currentSession,
    ),
  };
}

async function expectCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toMatchObject({ code });
}

describe("UpdateCommentUseCase", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(nowIso));
    vi.clearAllMocks();
    vi.mocked(logActivity).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ["blank text", ""],
    ["too-long text", "x".repeat(501)],
  ])(
    "rejects invalid %s before repository, content, moderation, activity, or enrichment work",
    async (_label, text) => {
      const { useCase, repository, contentService, enricher } = createUseCase();

      await expectCode(
        useCase.execute("comment-validation-1", { text }),
        "VALIDATION_ERROR",
      );

      expect(repository.getCommentById).not.toHaveBeenCalled();
      expect(repository.updateComment).not.toHaveBeenCalled();
      expect(contentService.process).not.toHaveBeenCalled();
      expect(logActivity).not.toHaveBeenCalled();
      expect(enricher.enrichOne).not.toHaveBeenCalled();
    },
  );

  it("reads the existing comment before processing and updating", async () => {
    const { useCase, repository, contentService } = createUseCase();

    await useCase.execute("comment-before-42", {
      text: "Edited text after read",
    });

    expect(repository.getCommentById).toHaveBeenCalledWith("comment-before-42");
    expect(repository.updateComment).toHaveBeenCalledTimes(1);
    expect(repository.getCommentById.mock.invocationCallOrder[0]).toBeLessThan(
      contentService.process.mock.invocationCallOrder[0],
    );
    expect(repository.getCommentById.mock.invocationCallOrder[0]).toBeLessThan(
      repository.updateComment.mock.invocationCallOrder[0],
    );
  });

  it("passes distinct user, text, and comments resource values into content processing", async () => {
    const { useCase, contentService } = createUseCase();

    await useCase.execute("comment-processing-501", {
      text: "  Edited comment for moderation  ",
    });

    expect(contentService.process).toHaveBeenCalledWith(
      "editor-user-17",
      "  Edited comment for moderation  ",
      "comments",
      undefined,
    );
  });

  it("updates the requested comment with text, edit flag, moderation status, context, NSFW flag, and timestamp", async () => {
    const { useCase, repository, contentService } = createUseCase();
    vi.mocked(contentService.process).mockResolvedValueOnce(
      processed({
        isPending: true,
        isNSFW: true,
        moderationLogPayloadForResource: moderationPayload,
      }),
    );

    await useCase.execute("comment-update-203", {
      text: "Edited payload text",
    });

    expect(repository.updateComment).toHaveBeenCalledTimes(1);
    const [commentId, payload] = repository.updateComment.mock.calls[0];
    expect(commentId).toBe("comment-update-203");
    expect(payload).toMatchObject({
      text: "Edited payload text",
      isEdited: true,
      isPending: true,
      moderationStatus: "pending",
      isNSFW: true,
      moderationContext: {
        timestamp: "2026-07-08T06:07:08.000Z",
        verdict: ModerationStatus.Pending,
        categories: ["harassment", "toxicity"],
        actionTaken: "FLAGGED_FOR_REVIEW",
        source: "ai",
        actorId: "comment-moderator-bot",
        reasonSummary: "Needs human review",
        reasonDetails: "Distinct risky edit details",
        evidence: [
          {
            category: "toxicity",
            score: 0.82,
            sources: ["text"],
          },
        ],
      },
    });
    expect(payload.updatedAt).toEqual(new Date(nowIso));
  });

  it("uses visible moderation status and null moderation context for non-pending processed content", async () => {
    const { useCase, repository, contentService } = createUseCase();
    vi.mocked(contentService.process).mockResolvedValueOnce(
      processed({
        isPending: false,
        isNSFW: false,
        moderationLogPayloadForResource: undefined,
      }),
    );

    await useCase.execute("comment-visible-204", {
      text: "Visible edited text",
    });

    expect(repository.updateComment).toHaveBeenCalledWith(
      "comment-visible-204",
      expect.objectContaining({
        text: "Visible edited text",
        isPending: false,
        moderationStatus: "visible",
        moderationContext: null,
        isNSFW: false,
      }),
    );
  });

  it("logs activity only after the repository update succeeds", async () => {
    const { useCase, repository } = createUseCase();

    await useCase.execute("comment-activity-305", {
      text: "Edited text with activity",
    });

    expect(logActivity).toHaveBeenCalledWith(
      "editor-user-17",
      "COMMENT_UPDATED",
      "User updated comment comment-activity-305",
    );
    expect(repository.updateComment.mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(logActivity).mock.invocationCallOrder[0],
    );
  });

  it("does not log activity or enrich when the repository update fails", async () => {
    const repository = createRepository();
    repository.updateComment.mockRejectedValueOnce(new Error("update failed"));
    const { useCase, enricher } = createUseCase({ repository });

    await expect(
      useCase.execute("comment-db-failure-406", {
        text: "Edited text before failure",
      }),
    ).rejects.toThrow("update failed");

    expect(logActivity).not.toHaveBeenCalled();
    expect(enricher.enrichOne).not.toHaveBeenCalled();
  });

  it("enriches and returns the updated comment instead of the stale original comment", async () => {
    const { useCase, enricher } = createUseCase();

    const result = await useCase.execute("comment-return-507", {
      text: "Edited text for return",
    });

    expect(enricher.enrichOne).toHaveBeenCalledWith(updatedComment, session);
    expect(enricher.enrichOne).not.toHaveBeenCalledWith(
      originalComment,
      session,
    );
    expect(result).toBe(enrichedUpdatedComment);
  });

  it("propagates enrichment failures after a successful repository update", async () => {
    const enricher = createEnricher();
    enricher.enrichOne.mockRejectedValueOnce(new Error("enrichment failed"));
    const { useCase, repository } = createUseCase({ enricher });

    await expect(
      useCase.execute("comment-enrich-failure-608", {
        text: "Edited text before enrichment failure",
      }),
    ).rejects.toThrow("enrichment failed");

    expect(repository.updateComment).toHaveBeenCalledTimes(1);
    expect(logActivity).toHaveBeenCalledTimes(1);
  });
});
