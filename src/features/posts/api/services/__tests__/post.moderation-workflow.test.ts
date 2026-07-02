import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type { ModerationLogPayload } from "@/features/moderation/api/services/moderationLog.service";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

vi.mock("@/features/moderation/api/services/moderationLog.service", () => ({
  logModerationEvent: vi.fn(),
}));

import { logActivity } from "@/features/activity/api/services";
import { logModerationEvent } from "@/features/moderation/api/services/moderationLog.service";
import { PostModerationWorkflow } from "../post.moderation-workflow";
import {
  createMockPost,
  createMockPostRepository,
  expectAppError,
} from "./helpers/post-test.helpers";

type ContentModerationPayload = Omit<
  ModerationLogPayload,
  "resourceType" | "resourceId"
>;

const contentModerationPayload: ContentModerationPayload = {
  userId: "user-1",
  verdict: ModerationStatus.Pending,
  categories: ["violence"],
  actionTaken: "FLAGGED_FOR_REVIEW",
  source: "ai",
  actorId: "system",
  reasonSummary: "AI moderation result: pending",
  reasonDetails: "Categories: violence.",
};

describe("PostModerationWorkflow", () => {
  let repository: ReturnType<typeof createMockPostRepository>;
  let workflow: PostModerationWorkflow;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = createMockPostRepository();
    workflow = new PostModerationWorkflow(repository);

    vi.mocked(logModerationEvent).mockResolvedValue(undefined);
    vi.mocked(logActivity).mockResolvedValue(undefined);
  });

  describe("recordContentModerationResult", () => {
    it.each([null, undefined])(
      "no-ops when moderation payload is %s",
      async (payload) => {
        await workflow.recordContentModerationResult("post-1", payload);

        expect(logModerationEvent).not.toHaveBeenCalled();
      },
    );

    it("logs a moderation event with post resource metadata", async () => {
      await workflow.recordContentModerationResult(
        "post-1",
        contentModerationPayload,
      );

      expect(logModerationEvent).toHaveBeenCalledWith({
        ...contentModerationPayload,
        resourceType: "post",
        resourceId: "post-1",
      });
    });
  });

  describe("setModerationStatus", () => {
    it("throws NOT_FOUND when the post does not exist", async () => {
      vi.mocked(repository.getPostById).mockResolvedValue(null);

      await expectAppError(
        () =>
          workflow.setModerationStatus("missing-post", ModerationStatus.Approved),
        "NOT_FOUND",
      );
      expect(repository.updatePost).not.toHaveBeenCalled();
      expect(logActivity).not.toHaveBeenCalled();
    });

    it("sets isPending to false for approved status", async () => {
      const post = createMockPost({ id: "post-1", userId: "author-1" });
      vi.mocked(repository.getPostById).mockResolvedValue(post);
      vi.mocked(repository.updatePost).mockResolvedValue({
        ...post,
        isPending: false,
      });

      await workflow.setModerationStatus("post-1", ModerationStatus.Approved);

      expect(repository.updatePost).toHaveBeenCalledWith("post-1", {
        isPending: false,
      });
    });

    it("sets isPending to true for pending status", async () => {
      const post = createMockPost({ id: "post-1", userId: "author-1" });
      vi.mocked(repository.getPostById).mockResolvedValue(post);
      vi.mocked(repository.updatePost).mockResolvedValue({
        ...post,
        isPending: true,
      });

      await workflow.setModerationStatus("post-1", ModerationStatus.Pending);

      expect(repository.updatePost).toHaveBeenCalledWith("post-1", {
        isPending: true,
      });
    });

    it("logs activity when status changes", async () => {
      const post = createMockPost({ id: "post-1", userId: "author-1" });
      vi.mocked(repository.getPostById).mockResolvedValue(post);
      vi.mocked(repository.updatePost).mockResolvedValue({
        ...post,
        isPending: false,
      });

      await workflow.setModerationStatus("post-1", ModerationStatus.Approved);

      expect(logActivity).toHaveBeenCalledWith(
        "author-1",
        "POST_MODERATION_STATUS_CHANGED",
        "Moderation status of post post-1 changed to approved",
      );
    });
  });

  describe("recordUserReport", () => {
    it("logs the expected user-report moderation event", async () => {
      const post = createMockPost({ id: "post-1", userId: "author-1" });

      await workflow.recordUserReport({
        post,
        postId: "post-1",
        reporterId: "reporter-1",
        reason: "spam",
        details: "repeated ads",
      });

      expect(logModerationEvent).toHaveBeenCalledWith({
        userId: "author-1",
        timestamp: expect.any(Date),
        verdict: ModerationStatus.Pending,
        categories: ["spam"],
        actionTaken: "FLAGGED_FOR_REVIEW",
        resourceType: "post",
        resourceId: "post-1",
        source: "user_report",
        actorId: "reporter-1",
        reasonSummary: "Post reported by user",
        reasonDetails: "spam: repeated ads",
      });
    });
  });

  describe("recordReportThresholdHidden", () => {
    it("logs the expected threshold-hidden moderation event", async () => {
      const post = createMockPost({ id: "post-1", userId: "author-1" });

      await workflow.recordReportThresholdHidden({
        post,
        postId: "post-1",
        reporterId: "reporter-1",
        reason: "hate",
        details: "threshold reached",
      });

      expect(logModerationEvent).toHaveBeenCalledWith({
        userId: "author-1",
        timestamp: expect.any(Date),
        verdict: ModerationStatus.Pending,
        categories: ["hate"],
        actionTaken: "FLAGGED_FOR_REVIEW",
        resourceType: "post",
        resourceId: "post-1",
        source: "user_report",
        actorId: "reporter-1",
        reasonSummary: "Post hidden after multiple user reports",
        reasonDetails: "threshold reached",
      });
    });
  });
});
