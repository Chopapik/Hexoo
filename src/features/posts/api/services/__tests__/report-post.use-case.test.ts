import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

import { ReportPostUseCase } from "../use-cases/report-post.use-case";
import {
  createMockPost,
  createMockPostModerationWorkflow,
  createMockPostRepository,
  createMockSession,
  expectAppError,
} from "./helpers/post-test.helpers";
import { logActivity } from "@/features/activity/api/services";

describe("ReportPostUseCase", () => {
  let repository: ReturnType<typeof createMockPostRepository>;
  let moderationWorkflow: ReturnType<typeof createMockPostModerationWorkflow>;
  let useCase: ReportPostUseCase;
  const post = createMockPost({ id: "post-1" });

  beforeEach(() => {
    vi.clearAllMocks();
    repository = createMockPostRepository();
    moderationWorkflow = createMockPostModerationWorkflow();
    useCase = new ReportPostUseCase(
      repository,
      moderationWorkflow,
      createMockSession(),
    );
    vi.mocked(repository.getPostById).mockResolvedValue(post);
    vi.mocked(repository.hasUserReportedPost).mockResolvedValue(false);
    vi.mocked(repository.reportPost).mockResolvedValue({
      hidden: false,
      reportsCount: 1,
    });
    vi.mocked(moderationWorkflow.recordUserReport).mockResolvedValue(undefined);
    vi.mocked(moderationWorkflow.recordReportThresholdHidden).mockResolvedValue(
      undefined,
    );
    vi.mocked(logActivity).mockResolvedValue(undefined);
  });

  it("throws AUTH_REQUIRED when no session", async () => {
    const noSession = new ReportPostUseCase(
      repository,
      moderationWorkflow,
      null,
    );
    await expectAppError(
      () => noSession.execute("post-1", "spam"),
      "AUTH_REQUIRED",
    );
  });

  it("throws VALIDATION_ERROR for invalid reason", async () => {
    await expectAppError(
      () => useCase.execute("post-1", "not-a-reason"),
      "VALIDATION_ERROR",
    );
  });

  it("throws NOT_FOUND when post does not exist", async () => {
    vi.mocked(repository.getPostById).mockResolvedValue(null);
    await expectAppError(() => useCase.execute("post-1", "spam"), "NOT_FOUND");
  });

  it("throws CONFLICT when user already reported the post", async () => {
    vi.mocked(repository.hasUserReportedPost).mockResolvedValue(true);
    await expectAppError(() => useCase.execute("post-1", "spam"), "CONFLICT");
  });

  it("reports post and records moderation workflow", async () => {
    const result = await useCase.execute("post-1", "spam", "repeated ads");

    expect(repository.reportPost).toHaveBeenCalledWith(
      "post-1",
      expect.objectContaining({
        uid: "user-1",
        reason: "spam",
        details: "repeated ads",
      }),
    );
    expect(moderationWorkflow.recordUserReport).toHaveBeenCalled();
    expect(moderationWorkflow.recordReportThresholdHidden).not.toHaveBeenCalled();
    expect(logActivity).toHaveBeenCalledWith(
      "user-1",
      "POST_REPORTED",
      expect.stringContaining("post-1"),
    );
    expect(result).toEqual({ hidden: false, reportsCount: 1 });
  });

  it("records threshold hidden when post becomes hidden", async () => {
    vi.mocked(repository.reportPost).mockResolvedValue({
      hidden: true,
      reportsCount: 5,
    });

    const result = await useCase.execute("post-1", "hate");

    expect(moderationWorkflow.recordReportThresholdHidden).toHaveBeenCalled();
    expect(result).toEqual({ hidden: true, reportsCount: 5 });
  });

  it("propagates repository errors", async () => {
    vi.mocked(repository.reportPost).mockRejectedValue(new Error("db error"));
    await expect(useCase.execute("post-1", "spam")).rejects.toThrow("db error");
  });
});
