import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

import { RestrictUserUseCase } from "../use-cases/restrict-user.use-case";
import { UserRestrictionApplier } from "../user.restriction";
import {
  createMockSession,
  createMockUserRepository,
  expectAppError,
} from "./helpers/user-test.helpers";
import { UserRole } from "../../../types/user.type";

describe("RestrictUserUseCase", () => {
  let repository: ReturnType<typeof createMockUserRepository>;
  let restrictionApplier: UserRestrictionApplier;
  let useCase: RestrictUserUseCase;

  beforeEach(() => {
    repository = createMockUserRepository();
    restrictionApplier = new UserRestrictionApplier(repository);
    useCase = new RestrictUserUseCase(
      restrictionApplier,
      createMockSession(UserRole.Admin),
    );
    vi.spyOn(restrictionApplier, "apply").mockResolvedValue(undefined);
  });

  it("delegates to restriction applier with ADMIN source", async () => {
    await useCase.execute({ uid: "user-1", reason: "harassment" });

    expect(restrictionApplier.apply).toHaveBeenCalledWith(
      "user-1",
      "harassment",
      "ADMIN",
    );
  });

  it("allows moderator session", async () => {
    const modUseCase = new RestrictUserUseCase(
      restrictionApplier,
      createMockSession(UserRole.Moderator),
    );

    await modUseCase.execute({ uid: "user-1", reason: "spam" });

    expect(restrictionApplier.apply).toHaveBeenCalled();
  });

  it("throws AUTH_REQUIRED without session", async () => {
    const noSession = new RestrictUserUseCase(restrictionApplier, null);
    await expectAppError(
      () => noSession.execute({ uid: "u1", reason: "x" }),
      "AUTH_REQUIRED",
    );
  });

  it("throws FORBIDDEN for regular user", async () => {
    const asUser = new RestrictUserUseCase(
      restrictionApplier,
      createMockSession(UserRole.User),
    );
    await expectAppError(
      () => asUser.execute({ uid: "u1", reason: "x" }),
      "FORBIDDEN",
    );
  });
});
