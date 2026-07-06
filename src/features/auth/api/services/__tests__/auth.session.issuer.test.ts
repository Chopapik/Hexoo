import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthRepository } from "../../repositories/authRepository.interface";
import type { UserEntity } from "@/features/users/types/user.entity";
import { UserRole } from "@/features/users/types/user.type";
import type { OAuthSessionUser } from "../auth.service.interface";
import { AuthSessionMapper } from "../auth.session.mapper";
import {
  AuthSessionIssuer,
  SESSION_EXPIRES_MS,
} from "../auth.session.issuer";

vi.mock("@/features/auth/api/utils/session.cookies", () => ({
  setSessionCookie: vi.fn(async () => undefined),
  setRefreshCookie: vi.fn(async () => undefined),
}));

import {
  setRefreshCookie,
  setSessionCookie,
} from "@/features/auth/api/utils/session.cookies";

type ActivityLogger = ConstructorParameters<typeof AuthSessionIssuer>[1];

const mappedUser: OAuthSessionUser = {
  uid: "mapped-oauth-user-1",
  email: "token.email@example.test",
  name: "Mapped Session User",
  role: UserRole.Moderator,
  lastOnline: "2026-07-06T10:00:00.000Z",
};

function userEntity(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    uid: "db-profile-uid-1",
    email: "db.authoritative@example.test",
    name: "Trusted DB Profile",
    hasUsername: true,
    role: UserRole.Moderator,
    createdAt: new Date("2026-07-01T08:00:00.000Z"),
    updatedAt: new Date("2026-07-02T08:00:00.000Z"),
    lastOnline: new Date("2026-07-03T08:00:00.000Z"),
    isActive: true,
    isBanned: false,
    ...overrides,
  };
}

function createAuthRepository(): AuthRepository {
  return {
    verifyIdToken: vi.fn<AuthRepository["verifyIdToken"]>(),
    verifyPassword: vi.fn<AuthRepository["verifyPassword"]>(),
    signInWithPassword: vi.fn<AuthRepository["signInWithPassword"]>(),
    createSessionCookie:
      vi.fn<AuthRepository["createSessionCookie"]>().mockResolvedValue(
        "issued-session-cookie-1",
      ),
    refreshSession: vi.fn<AuthRepository["refreshSession"]>(),
    getUserByEmail: vi.fn<AuthRepository["getUserByEmail"]>(),
    deleteUser: vi.fn<AuthRepository["deleteUser"]>(),
    updateUser: vi.fn<AuthRepository["updateUser"]>(),
    createUser: vi.fn<AuthRepository["createUser"]>(),
  };
}

function createMapper(output: OAuthSessionUser = mappedUser) {
  const toOAuthSessionUser =
    vi.fn<AuthSessionMapper["toOAuthSessionUser"]>().mockReturnValue(output);

  return {
    mapper: {
      toOAuthSessionUser,
    } as unknown as AuthSessionMapper,
    toOAuthSessionUser,
  };
}

function createIssuer() {
  const authRepository = createAuthRepository();
  const logActivity = vi.fn<ActivityLogger>().mockResolvedValue(undefined);
  const { mapper, toOAuthSessionUser } = createMapper();

  return {
    authRepository,
    logActivity,
    toOAuthSessionUser,
    issuer: new AuthSessionIssuer(authRepository, logActivity, mapper),
  };
}

describe("AuthSessionIssuer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects deleted users before auth session or cookie writes", async () => {
    const { issuer, authRepository, logActivity, toOAuthSessionUser } =
      createIssuer();
    const deletedUser = userEntity({
      uid: "deleted-db-profile-1",
      email: "deleted.db@example.test",
      deletedAt: new Date("2026-07-04T08:00:00.000Z"),
      sessionInvalidatedAt: new Date("2026-07-04T08:00:00.000Z"),
    });

    await expect(
      issuer.issueAppSession({
        userData: deletedUser,
        idToken: "deleted-id-token",
        refreshToken: "deleted-refresh-token",
        email: "deleted.token@example.test",
        activityDetails: "Deleted user login",
      }),
    ).rejects.toMatchObject({ code: "ACCOUNT_DELETED" });

    expect(authRepository.createSessionCookie).not.toHaveBeenCalled();
    expect(logActivity).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
    expect(setRefreshCookie).not.toHaveBeenCalled();
    expect(toOAuthSessionUser).not.toHaveBeenCalled();
  });

  it("rejects banned users after failed-login activity but before auth session or cookie writes", async () => {
    const { issuer, authRepository, logActivity, toOAuthSessionUser } =
      createIssuer();
    const bannedUser = userEntity({
      uid: "banned-db-profile-1",
      email: "banned.db@example.test",
      isBanned: true,
      bannedAt: new Date("2026-07-05T08:00:00.000Z"),
      bannedBy: "admin-ban-1",
      bannedReason: "policy violation",
    });

    await expect(
      issuer.issueAppSession({
        userData: bannedUser,
        idToken: "banned-id-token",
        refreshToken: "banned-refresh-token",
        email: "banned.token@example.test",
        activityDetails: "Banned user login",
      }),
    ).rejects.toMatchObject({ code: "ACCOUNT_BANNED" });

    expect(logActivity).toHaveBeenCalledWith(
      "banned-db-profile-1",
      "LOGIN_FAILED",
      "Login attempt on banned account",
    );
    expect(authRepository.createSessionCookie).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
    expect(setRefreshCookie).not.toHaveBeenCalled();
    expect(toOAuthSessionUser).not.toHaveBeenCalled();
  });

  it("creates the auth session, logs success, writes session and refresh cookies, and returns mapper output", async () => {
    const { issuer, authRepository, logActivity, toOAuthSessionUser } =
      createIssuer();
    const dbProfile = userEntity({
      uid: "db-profile-uid-2",
      email: "trusted.db@example.test",
      name: "Trusted DB Name",
      role: UserRole.Admin,
    });

    const result = await issuer.issueAppSession({
      userData: dbProfile,
      idToken: "trusted-id-token-2",
      refreshToken: "trusted-refresh-token-2",
      email: "token.email@example.test",
      activityDetails: "User logged in via OAuth",
    });

    expect(authRepository.createSessionCookie).toHaveBeenCalledWith(
      "trusted-id-token-2",
      SESSION_EXPIRES_MS,
    );
    expect(logActivity).toHaveBeenCalledWith(
      "db-profile-uid-2",
      "LOGIN_SUCCESS",
      "User logged in via OAuth",
    );
    expect(
      vi.mocked(authRepository.createSessionCookie).mock.invocationCallOrder[0],
    ).toBeLessThan(logActivity.mock.invocationCallOrder[0]);
    expect(logActivity.mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(setSessionCookie).mock.invocationCallOrder[0],
    );
    expect(setSessionCookie).toHaveBeenCalledWith("issued-session-cookie-1");
    expect(setRefreshCookie).toHaveBeenCalledWith("trusted-refresh-token-2");
    expect(toOAuthSessionUser).toHaveBeenCalledWith(
      dbProfile,
      "token.email@example.test",
    );
    expect(result).toBe(mappedUser);
  });

  it("skips refresh cookie writes when refresh token is absent", async () => {
    const { issuer } = createIssuer();

    await issuer.issueAppSession({
      userData: userEntity({ uid: "db-profile-no-refresh" }),
      idToken: "id-token-without-refresh",
      email: "token.without-refresh@example.test",
      activityDetails: "User logged in without refresh",
    });

    expect(setSessionCookie).toHaveBeenCalledWith("issued-session-cookie-1");
    expect(setRefreshCookie).not.toHaveBeenCalled();
  });

  it("does not log activity or write cookies when auth session cookie creation fails", async () => {
    const { issuer, authRepository, logActivity, toOAuthSessionUser } =
      createIssuer();
    vi.mocked(authRepository.createSessionCookie).mockRejectedValueOnce(
      new Error("auth session failed"),
    );

    await expect(
      issuer.issueAppSession({
        userData: userEntity({ uid: "db-profile-cookie-fail" }),
        idToken: "id-token-cookie-fail",
        refreshToken: "refresh-cookie-fail",
        email: "token.cookie-fail@example.test",
        activityDetails: "Cookie failure login",
      }),
    ).rejects.toThrow("auth session failed");

    expect(logActivity).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
    expect(setRefreshCookie).not.toHaveBeenCalled();
    expect(toOAuthSessionUser).not.toHaveBeenCalled();
  });

  it("wraps activity failures and does not write cookies or map a session user", async () => {
    const { issuer, authRepository, logActivity, toOAuthSessionUser } =
      createIssuer();
    logActivity.mockRejectedValueOnce(new Error("activity failed"));

    await expect(
      issuer.issueAppSession({
        userData: userEntity({ uid: "db-profile-activity-fail" }),
        idToken: "id-token-activity-fail",
        refreshToken: "refresh-activity-fail",
        email: "token.activity-fail@example.test",
        activityDetails: "Activity failure login",
      }),
    ).rejects.toMatchObject({ code: "INTERNAL_ERROR" });

    expect(authRepository.createSessionCookie).toHaveBeenCalledWith(
      "id-token-activity-fail",
      SESSION_EXPIRES_MS,
    );
    expect(setSessionCookie).not.toHaveBeenCalled();
    expect(setRefreshCookie).not.toHaveBeenCalled();
    expect(toOAuthSessionUser).not.toHaveBeenCalled();
  });
});
