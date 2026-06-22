import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/types/user.type";
import type { AuthRepository } from "../../repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import { CreateSessionUseCase } from "./create-session.use-case";
import { OAuthLoginUseCase } from "./oauth-login.use-case";
import { RestoreUserSessionUseCase } from "./restore-user-session.use-case";

vi.mock("@/features/auth/api/utils/session.cookies", () => ({
  clearAllAuthCookies: vi.fn(async () => undefined),
  getRefreshCookie: vi.fn(async () => ({
    hasRefresh: true,
    value: "refresh-token",
  })),
  setRefreshCookie: vi.fn(async () => undefined),
  setSessionCookie: vi.fn(async () => undefined),
}));

import {
  clearAllAuthCookies,
  setRefreshCookie,
  setSessionCookie,
} from "@/features/auth/api/utils/session.cookies";

const deletedUser = {
  uid: "deleted-1",
  email: "",
  name: "",
  hasUsername: false,
  role: UserRole.User,
  createdAt: new Date(),
  lastOnline: new Date(),
  isActive: false,
  deletedAt: new Date(),
  sessionInvalidatedAt: new Date(),
};

describe("deleted account authentication boundaries", () => {
  let authRepository: AuthRepository;
  let userRepository: UserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    authRepository = {
      verifyIdToken: vi.fn(async () => ({ uid: "deleted-1" })),
      refreshSession: vi.fn(async () => ({
        access_token: "access-token",
        refresh_token: "new-refresh-token",
      })),
      createSessionCookie: vi.fn(async () => "session-cookie"),
    } as unknown as AuthRepository;
    userRepository = {
      getUserByUid: vi.fn(async () => deletedUser),
      createOAuthPendingUser: vi.fn(async () => undefined),
    } as unknown as UserRepository;
  });

  it("rejects password/session creation before issuing cookies", async () => {
    const useCase = new CreateSessionUseCase(
      authRepository,
      userRepository,
      vi.fn(async () => undefined),
      {} as never,
    );

    await expect(useCase.execute("access-token", "refresh-token"))
      .rejects.toMatchObject({ code: "ACCOUNT_DELETED" });
    expect(setSessionCookie).not.toHaveBeenCalled();
    expect(setRefreshCookie).not.toHaveBeenCalled();
  });

  it("rejects OAuth tombstones instead of restarting onboarding", async () => {
    const issueAppSession = vi.fn();
    const useCase = new OAuthLoginUseCase(
      authRepository,
      userRepository,
      { issueAppSession } as never,
      vi.fn(async () => undefined),
    );

    await expect(useCase.execute({ idToken: "access-token" }))
      .rejects.toMatchObject({ code: "ACCOUNT_DELETED" });
    expect(issueAppSession).not.toHaveBeenCalled();
    expect(userRepository.createOAuthPendingUser).not.toHaveBeenCalled();
  });

  it("rejects refresh restoration and clears stale cookies", async () => {
    const result = await new RestoreUserSessionUseCase(
      authRepository,
      userRepository,
      {} as never,
    ).execute();

    expect(result).toBeNull();
    expect(clearAllAuthCookies).toHaveBeenCalledOnce();
    expect(setSessionCookie).not.toHaveBeenCalled();
    expect(setRefreshCookie).not.toHaveBeenCalled();
  });
});
