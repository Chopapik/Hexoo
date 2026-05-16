import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

import { UnrestrictUserUseCase } from "../use-cases/unrestrict-user.use-case";
import { logActivity } from "@/features/activity/api/services";
import {
  createMockSession,
  createMockUserRepository,
  expectAppError,
} from "./helpers/user-test.helpers";
import { UserRole } from "../../../types/user.type";

describe("UnrestrictUserUseCase", () => {
  let repository: ReturnType<typeof createMockUserRepository>;
  let useCase: UnrestrictUserUseCase;

  beforeEach(() => {
    repository = createMockUserRepository();
    useCase = new UnrestrictUserUseCase(
      repository,
      createMockSession(UserRole.Moderator),
    );
    vi.mocked(logActivity).mockResolvedValue(undefined);
  });

  it("removes restriction and logs activity", async () => {
    await useCase.execute("user-1");

    expect(repository.updateUserRestriction).toHaveBeenCalledWith({
      uid: "user-1",
      isRestricted: false,
    });
    expect(logActivity).toHaveBeenCalledWith(
      "user-1",
      "USER_UNRESTRICTED",
      "User restriction removed",
    );
  });

  it("throws AUTH_REQUIRED without session", async () => {
    const noSession = new UnrestrictUserUseCase(repository, null);
    await expectAppError(() => noSession.execute("user-1"), "AUTH_REQUIRED");
  });

  it("throws FORBIDDEN for regular user", async () => {
    const asUser = new UnrestrictUserUseCase(
      repository,
      createMockSession(UserRole.User),
    );
    await expectAppError(() => asUser.execute("user-1"), "FORBIDDEN");
  });

  it("throws INVALID_INPUT for empty uid", async () => {
    await expectAppError(() => useCase.execute(""), "INVALID_INPUT");
    expect(repository.updateUserRestriction).not.toHaveBeenCalled();
  });
});
