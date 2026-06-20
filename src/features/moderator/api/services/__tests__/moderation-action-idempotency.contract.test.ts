import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  rpc: vi.fn(),
  maybeSingle: vi.fn(),
  getLatestModerationLogForResource: vi.fn(),
}));

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: {
    rpc: database.rpc,
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: database.maybeSingle })),
      })),
    })),
  },
}));
vi.mock("@/features/images/api/image.service", () => ({ deleteImage: vi.fn() }));
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
});
