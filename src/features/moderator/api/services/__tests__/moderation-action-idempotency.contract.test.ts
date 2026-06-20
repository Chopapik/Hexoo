import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  rpc: vi.fn(),
  maybeSingle: vi.fn(),
  getLatestModerationLogForResource: vi.fn(),
  deleteImage: vi.fn(),
  commentImageRows: [] as Array<{ image_meta: unknown }>,
}));

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: {
    rpc: database.rpc,
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn((column: string) =>
          column === "post_id"
            ? Promise.resolve({ data: database.commentImageRows, error: null })
            : { maybeSingle: database.maybeSingle },
        ),
      })),
    })),
  },
}));
vi.mock("@/features/images/api/image.service", () => ({
  deleteImage: database.deleteImage,
}));
vi.mock("@/features/moderation/api/services/moderationLog.service", () => ({
  getLatestModerationLogForResource:
    database.getLatestModerationLogForResource,
}));

import { ModeratorService } from "../moderator.service";
import type { ModerationService } from "@/features/moderation/api/services/moderation.service.interface";
import { UserRole } from "@/features/users/types/user.type";

const moderationService = {} as ModerationService;
const session = {
  uid: "moderator-1",
  email: "moderator@example.com",
  name: "Moderator",
  role: UserRole.Moderator,
};

describe("moderator action idempotency contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.rpc.mockResolvedValue({ data: {}, error: null });
    database.deleteImage.mockResolvedValue(undefined);
    database.commentImageRows = [];
    database.getLatestModerationLogForResource.mockResolvedValue({
      verdict: "pending",
      reasonSummary: "Post moved to quarantine by moderator",
    });
  });

  it.each(["approve", "reject", "quarantine"] as const)(
    "does not duplicate post %s transaction/log side effects on retry",
    async (action) => {
      database.maybeSingle
        .mockResolvedValueOnce({
          data: { is_pending: action !== "quarantine" },
          error: null,
        })
        .mockResolvedValueOnce({
          data:
            action === "reject"
              ? null
              : { is_pending: action === "quarantine" },
          error: null,
        });
      const service = new ModeratorService(session, moderationService, null);
      const justification = action === "approve" ? "" : "reviewed";

      await service.reviewPost("post-1", action, false, [], justification);
      await service.reviewPost("post-1", action, false, [], justification);

      expect(database.rpc).toHaveBeenCalledTimes(1);
      expect(database.rpc).toHaveBeenCalledWith(
        "moderator_review_post_tx",
        expect.objectContaining({ p_action: action, p_post_id: "post-1" }),
      );
    },
  );

  it("applies the same no-op retry guard to comments", async () => {
    database.maybeSingle
      .mockResolvedValueOnce({ data: { is_pending: true }, error: null })
      .mockResolvedValueOnce({ data: { is_pending: false }, error: null });
    const service = new ModeratorService(session, moderationService, null);

    await service.reviewComment("comment-1", "approve", false, [], "");
    await service.reviewComment("comment-1", "approve", false, [], "");

    expect(database.rpc).toHaveBeenCalledTimes(1);
    expect(database.rpc).toHaveBeenCalledWith(
      "moderator_review_comment_tx",
      expect.objectContaining({
        p_action: "approve",
        p_comment_id: "comment-1",
      }),
    );
  });

  it("collects and deletes comment images when rejecting a post cascade", async () => {
    const postImage = {
      storageBucket: "bucket",
      storageLocation: "posts",
      fileName: "post.webp",
      downloadToken: "post-token",
      contentType: "image/webp",
      sizeBytes: 10,
    };
    const commentImage = { ...postImage, storageLocation: "comments", fileName: "comment.webp" };
    database.maybeSingle.mockResolvedValue({
      data: { is_pending: true },
      error: null,
    });
    database.commentImageRows = [{ image_meta: commentImage }];
    database.rpc.mockResolvedValue({
      data: { deletedImageMeta: postImage },
      error: null,
    });

    await new ModeratorService(session, moderationService, null).reviewPost(
      "post-1",
      "reject",
      false,
      [],
      "rejected",
    );

    expect(database.deleteImage).toHaveBeenCalledWith(postImage);
    expect(database.deleteImage).toHaveBeenCalledWith(commentImage);
  });

  it("keeps a moderator comment cleanup failure visible after DB commit", async () => {
    const image = {
      storageBucket: "bucket",
      storageLocation: "comments",
      fileName: "comment.webp",
      downloadToken: "token",
      contentType: "image/webp",
      sizeBytes: 10,
    };
    database.maybeSingle.mockResolvedValue({
      data: { is_pending: true },
      error: null,
    });
    database.rpc.mockResolvedValue({
      data: { deletedImageMeta: image },
      error: null,
    });
    database.deleteImage.mockRejectedValue(new Error("storage failed"));

    await expect(
      new ModeratorService(session, moderationService, null).reviewComment(
        "comment-1",
        "reject",
        false,
        [],
        "rejected",
      ),
    ).rejects.toThrow("storage failed");
  });
});
