import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const provider = vi.hoisted(() => ({
  moderateText: vi.fn(),
  moderateImage: vi.fn(),
  uploadImage: vi.fn(),
  prepareImage: vi.fn(),
  logModerationEvent: vi.fn(),
}));

vi.mock("@/features/moderation/api/textModeration", () => ({
  moderateText: provider.moderateText,
}));
vi.mock("@/features/moderation/api/imageModeration", () => ({
  moderateImage: provider.moderateImage,
}));
vi.mock("@/features/images/api/image.service", () => ({
  hasFile: (file?: File | null) => file instanceof File,
  prepareImage: provider.prepareImage,
  uploadPreparedImage: provider.uploadImage,
}));
vi.mock("@/features/moderation/api/services/moderationLog.service", () => ({
  logModerationEvent: provider.logModerationEvent,
}));
vi.mock("@/features/activity/api/services", () => ({ logActivity: vi.fn() }));

import { AppError } from "@/lib/AppError";
import { PostContentService } from "@/features/posts/api/services/post.content.service";
import type { PostRepository } from "@/features/posts/api/repositories/post.repository.interface";
import type { PostModerationWorkflow } from "@/features/posts/api/services/post.moderation-workflow";
import { CreatePostUseCase } from "@/features/posts/api/services/use-cases/create-post.use-case";
import {
  deriveCanonicalContentStatus,
  isPubliclyVisibleStatus,
} from "@/features/moderation/types/moderation.type";
import { UserRole } from "@/features/users/types/user.type";
import { performModeration } from "./assessSafety";

const cleanResult = { flagged: false, categories: [], categoryScores: {} };
const image = () => new File(["image"], "test.png", { type: "image/png" });

describe("moderation provider and evidence contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    provider.moderateText.mockResolvedValue(cleanResult);
    provider.moderateImage.mockResolvedValue(cleanResult);
    provider.prepareImage.mockImplementation(async (file: File) => ({
      file,
      inputBuffer: Buffer.from("image"),
      metadata: { width: 1, height: 1, pages: 1 },
    }));
  });

  afterEach(() => vi.useRealTimers());

  it("fails closed with a stable 503 error when the provider errors", async () => {
    provider.moderateText.mockRejectedValue(new Error("provider unavailable"));

    const error = await performModeration("user-1", "hello").catch(
      (caught) => caught,
    );

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ code: "MODERATION_UNAVAILABLE", status: 503 });
    expect(provider.logModerationEvent).not.toHaveBeenCalled();
  });

  it("fails closed with the same stable error on provider timeout", async () => {
    vi.useFakeTimers();
    provider.moderateText.mockReturnValue(new Promise(() => undefined));

    const assessment = expect(
      performModeration("user-1", "hello"),
    ).rejects.toMatchObject({
      code: "MODERATION_UNAVAILABLE",
      status: 503,
    });
    await vi.advanceTimersByTimeAsync(5_000);
    await assessment;
  });

  it("does not create content or upload an image when moderation is incomplete", async () => {
    provider.moderateText.mockRejectedValue(new Error("provider unavailable"));
    const repository = {
      createPost: vi.fn(),
      deletePost: vi.fn(),
    } as unknown as PostRepository;
    const workflow = {
      recordContentModerationResult: vi.fn(),
    } as unknown as PostModerationWorkflow;
    const useCase = new CreatePostUseCase(
      repository,
      new PostContentService(),
      workflow,
      {
        uid: "user-1",
        email: "user@example.com",
        name: "User",
        role: UserRole.User,
      },
      vi.fn(async () => undefined),
    );

    await expect(
      useCase.execute({ text: "hello", youtubeUrl: "", imageFile: image() }),
    ).rejects.toMatchObject({ code: "MODERATION_UNAVAILABLE" });

    expect(repository.createPost).not.toHaveBeenCalled();
    expect(provider.moderateImage).not.toHaveBeenCalled();
    expect(provider.uploadImage).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "text-only",
      textResult: {
        flagged: true,
        categories: ["hate"],
        categoryScores: { hate: 0.8 },
      },
      imageResult: cleanResult,
      file: undefined,
      expected: [{ category: "hate", score: 0.8, sources: ["text"] }],
    },
    {
      name: "image-only",
      textResult: cleanResult,
      imageResult: {
        flagged: true,
        categories: ["violence"],
        categoryScores: { violence: 0.95 },
      },
      file: image(),
      expected: [
        { category: "violence", score: 0.95, sources: ["image"] },
      ],
    },
  ])("preserves $name evidence sources", async (fixture) => {
    provider.moderateText.mockResolvedValue(fixture.textResult);
    provider.moderateImage.mockResolvedValue(fixture.imageResult);

    const result = await performModeration(
      "user-1",
      fixture.name === "text-only" ? "content" : "",
      fixture.file,
    );

    expect(result.moderationEvidence).toEqual(fixture.expected);
    expect(result.moderationLogPayloadForResource?.evidence).toEqual(
      fixture.expected,
    );
  });

  it("preserves mixed sources per category in deterministic order", async () => {
    provider.moderateText.mockResolvedValue({
      flagged: true,
      categories: ["violence", "hate"],
      categoryScores: { violence: 0.93, hate: 0.8 },
    });
    provider.moderateImage.mockResolvedValue({
      flagged: true,
      categories: ["violence", "harassment"],
      categoryScores: { violence: 0.96, harassment: 0.82 },
    });

    const first = await performModeration("user-1", "content", image());
    const second = await performModeration("user-1", "content", image());
    const expected = [
      { category: "harassment", score: 0.82, sources: ["image"] },
      { category: "hate", score: 0.8, sources: ["text"] },
      { category: "violence", score: 0.96, sources: ["text", "image"] },
    ];

    expect(first.moderationEvidence).toEqual(expected);
    expect(second.moderationEvidence).toEqual(expected);
  });
});

describe("canonical content status contract", () => {
  it.each([
    [{ isPending: false }, "visible"],
    [{ isPending: true }, "pending"],
    [{ isPending: false, decision: "rejected" as const }, "rejected"],
    [
      {
        isPending: true,
        decision: "pending" as const,
        reasonSummary: "Post moved to quarantine by moderator",
      },
      "quarantined",
    ],
  ])("normalizes %o to %s", (input, expected) => {
    const status = deriveCanonicalContentStatus(input);
    expect(status).toBe(expected);
    expect(isPubliclyVisibleStatus(status)).toBe(expected === "visible");
  });
});
