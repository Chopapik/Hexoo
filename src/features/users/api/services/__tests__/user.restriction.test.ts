import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserRestrictionApplier } from "../user.restriction";
import {
  createMockUserRepository,
  expectAppError,
} from "./helpers/user-test.helpers";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

import { logActivity } from "@/features/activity/api/services";

describe("UserRestrictionApplier", () => {
  let repository: ReturnType<typeof createMockUserRepository>;
  let applier: UserRestrictionApplier;

  beforeEach(() => {
    repository = createMockUserRepository();
    applier = new UserRestrictionApplier(repository);
    vi.mocked(logActivity).mockResolvedValue(undefined);
  });

  it("applies ADMIN restriction and logs activity", async () => {
    await applier.apply("user-1", "spam", "ADMIN");

    expect(repository.updateUserRestriction).toHaveBeenCalledWith({
      uid: "user-1",
      isRestricted: true,
      restrictedBy: "ADMIN",
      restrictedReason: "spam",
    });
    expect(logActivity).toHaveBeenCalledWith(
      "user-1",
      "USER_RESTRICTED",
      "Restricted by ADMIN. Reason: spam",
    );
  });

  it("applies AI_SYSTEM restriction", async () => {
    await applier.apply("user-2", "toxic content", "AI_SYSTEM");

    expect(repository.updateUserRestriction).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "user-2",
        restrictedBy: "AI_SYSTEM",
        restrictedReason: "toxic content",
      }),
    );
  });

  it("throws INVALID_INPUT when uid is empty", async () => {
    await expectAppError(
      () => applier.apply("", "reason", "ADMIN"),
      "INVALID_INPUT",
    );
    expect(repository.updateUserRestriction).not.toHaveBeenCalled();
    expect(logActivity).not.toHaveBeenCalled();
  });
});
