import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

import { RestrictUserBySystemUseCase } from "../use-cases/restrict-user-by-system.use-case";
import { UserRestrictionApplier } from "../user.restriction";
import { createMockUserRepository } from "./helpers/user-test.helpers";

describe("RestrictUserBySystemUseCase", () => {
  let restrictionApplier: UserRestrictionApplier;
  let useCase: RestrictUserBySystemUseCase;

  beforeEach(() => {
    restrictionApplier = new UserRestrictionApplier(createMockUserRepository());
    useCase = new RestrictUserBySystemUseCase(restrictionApplier);
    vi.spyOn(restrictionApplier, "apply").mockResolvedValue(undefined);
  });

  it("delegates to restriction applier with AI_SYSTEM source", async () => {
    await useCase.execute("user-1", "auto moderation");

    expect(restrictionApplier.apply).toHaveBeenCalledWith(
      "user-1",
      "auto moderation",
      "AI_SYSTEM",
    );
  });
});
