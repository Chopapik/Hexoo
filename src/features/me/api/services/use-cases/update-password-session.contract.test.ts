import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/types/user.type";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import { UpdatePasswordUseCase } from "./update-password.use-case";
import { RestoreUserSessionUseCase } from "@/features/auth/api/services/use-cases/restore-user-session.use-case";
import { AuthSessionMapper } from "@/features/auth/api/services/auth.session.mapper";
import { AdminService } from "@/features/admin/api/services";
import { isTokenIssuedBeforeSessionCutoff } from "@/features/auth/api/utils/session-cutoff";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(async () => undefined),
}));

vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: vi.fn(() => undefined),
}));

vi.mock("@/features/auth/api/utils/session.cookies", () => ({
  getRefreshCookie: vi.fn(),
  setSessionCookie: vi.fn(async () => undefined),
  setRefreshCookie: vi.fn(async () => undefined),
  clearAllAuthCookies: vi.fn(async () => undefined),
}));

vi.mock("@/features/auth/api/repositories", () => ({
  authRepository: {
    updateUser: vi.fn(async () => undefined),
  },
}));

vi.mock("@/features/users/api/repositories", () => ({
  userRepository: {
    updateUser: vi.fn(async () => undefined),
  },
}));

import {
  clearAllAuthCookies,
  getRefreshCookie,
  setRefreshCookie,
  setSessionCookie,
} from "@/features/auth/api/utils/session.cookies";
import { authRepository as adminAuthRepository } from "@/features/auth/api/repositories";
import { userRepository as adminUserRepository } from "@/features/users/api/repositories";

function jwtWithIat(uid: string, iatSeconds: number): string {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString(
    "base64url",
  );
  const payload = Buffer.from(JSON.stringify({ sub: uid, iat: iatSeconds }))
    .toString("base64url");
  return `${header}.${payload}.`;
}

function authRepository(): AuthRepository {
  return {
    verifyIdToken: vi.fn(async () => ({
      uid: "user-001",
      email: "user@example.test",
    })),
    verifyPassword: vi.fn(async () => ({
      uid: "user-001",
      email: "user@example.test",
    })),
    signInWithPassword: vi.fn(async () => ({
      access_token: jwtWithIat("user-001", 1_800_000_000),
      refresh_token: "fresh-refresh",
    })),
    createSessionCookie: vi.fn(),
    refreshSession: vi.fn(async () => ({
      access_token: jwtWithIat("user-001", 1_700_000_000),
      refresh_token: "new-refresh",
    })),
    getUserByEmail: vi.fn(),
    deleteUser: vi.fn(),
    updateUser: vi.fn(async () => undefined),
    createUser: vi.fn(),
  };
}

function userRepository(
  options: {
    updatedAt?: Date;
    sessionInvalidatedAt?: Date;
  } = {},
): UserRepository {
  return {
    createUser: vi.fn(),
    createOAuthPendingUser: vi.fn(),
    getUserByUid: vi.fn(async () => ({
      uid: "user-001",
      email: "user@example.test",
      name: "User",
      hasUsername: true,
      role: UserRole.User,
      createdAt: new Date("2023-01-01T00:00:00.000Z"),
      updatedAt: options.updatedAt,
      sessionInvalidatedAt: options.sessionInvalidatedAt,
      lastOnline: new Date("2023-01-01T00:00:00.000Z"),
      isBanned: false,
    })),
    getUsersByIds: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
    updateUserRestriction: vi.fn(),
    getAllUsers: vi.fn(),
    deleteUser: vi.fn(),
    updateUser: vi.fn(async () => undefined),
  };
}

describe("AUTH-PASSWORD-SESSION-001 local password session enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRefreshCookie).mockResolvedValue({
      hasRefresh: true,
      value: "current-refresh",
    });
  });

  it("self-service password change preserves its fresh session and rejects old sessions", async () => {
    const auth = authRepository();
    const freshAccessToken = jwtWithIat("user-001", 1_800_000_000);
    vi.mocked(auth.signInWithPassword).mockResolvedValue({
      access_token: freshAccessToken,
      refresh_token: "fresh-refresh",
    });
    const users = userRepository();
    const useCase = new UpdatePasswordUseCase(
      {
        uid: "user-001",
        email: "user@example.test",
        name: "User",
        role: UserRole.User,
        isBanned: false,
      },
      users,
      auth,
    );

    await useCase.execute({
      oldPassword: "old-password",
      newPassword: "new-password",
      reNewPassword: "new-password",
    });

    expect(auth.updateUser).toHaveBeenCalledWith("user-001", {
      password: "new-password",
    });
    expect(auth.signInWithPassword).toHaveBeenCalledWith(
      "user@example.test",
      "new-password",
    );
    expect(auth.refreshSession).not.toHaveBeenCalled();
    expect(users.updateUser).toHaveBeenCalledWith("user-001", {
      sessionInvalidatedAt: new Date(1_800_000_000 * 1000 - 1),
    });
    expect(setSessionCookie).toHaveBeenCalledWith(freshAccessToken);
    expect(setRefreshCookie).toHaveBeenCalledWith("fresh-refresh");

    const cutoff = {
      sessionInvalidatedAt: new Date(1_800_000_000 * 1000 - 1),
    };
    expect(isTokenIssuedBeforeSessionCutoff(freshAccessToken, cutoff)).toBe(
      false,
    );
    expect(
      isTokenIssuedBeforeSessionCutoff(
        jwtWithIat("user-001", 1_700_000_000),
        cutoff,
      ),
    ).toBe(true);
  });

  it("admin password reset bumps the target local session cutoff", async () => {
    const service = new AdminService({
      uid: "admin-001",
      email: "admin@example.test",
      name: "Admin",
      role: UserRole.Admin,
      isBanned: false,
    });

    await service.adminUpdateUserPassword("user-001", "new-password");

    expect(adminAuthRepository.updateUser).toHaveBeenCalledWith("user-001", {
      password: "new-password",
    });
    expect(adminUserRepository.updateUser).toHaveBeenCalledWith("user-001", {
      sessionInvalidatedAt: expect.any(Date),
    });
    expect(setSessionCookie).not.toHaveBeenCalled();
    expect(setRefreshCookie).not.toHaveBeenCalled();

    const cutoff = vi.mocked(adminUserRepository.updateUser).mock.calls[0][1]
      .sessionInvalidatedAt;
    expect(
      isTokenIssuedBeforeSessionCutoff(
        jwtWithIat("user-001", 1_700_000_000),
        { sessionInvalidatedAt: cutoff },
      ),
    ).toBe(true);
  });

  it("does not restore app cookies from a refresh token issued before password cutoff", async () => {
    vi.mocked(getRefreshCookie).mockResolvedValue({
      hasRefresh: true,
      value: "old-refresh",
    });
    const auth = authRepository();
    const users = userRepository({
      sessionInvalidatedAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const result = await new RestoreUserSessionUseCase(
      auth,
      users,
      new AuthSessionMapper(),
    ).execute();

    expect(result).toBeNull();
    expect(clearAllAuthCookies).toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
    expect(setRefreshCookie).not.toHaveBeenCalled();
  });

  it("restores app cookies from a refresh token issued after password cutoff", async () => {
    vi.mocked(getRefreshCookie).mockResolvedValue({
      hasRefresh: true,
      value: "new-refresh",
    });
    const auth = authRepository();
    vi.mocked(auth.refreshSession).mockResolvedValue({
      access_token: jwtWithIat("user-001", 1_800_000_000),
      refresh_token: "new-refresh-2",
    });
    const users = userRepository({
      sessionInvalidatedAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const result = await new RestoreUserSessionUseCase(
      auth,
      users,
      new AuthSessionMapper(),
    ).execute();

    expect(result).toMatchObject({ uid: "user-001" });
    expect(setSessionCookie).toHaveBeenCalled();
    expect(setRefreshCookie).toHaveBeenCalledWith("new-refresh-2");
    expect(clearAllAuthCookies).not.toHaveBeenCalled();
  });

  it("does not treat ordinary updatedAt changes as a session cutoff", async () => {
    vi.mocked(getRefreshCookie).mockResolvedValue({
      hasRefresh: true,
      value: "old-refresh",
    });
    const auth = authRepository();
    const users = userRepository({
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const result = await new RestoreUserSessionUseCase(
      auth,
      users,
      new AuthSessionMapper(),
    ).execute();

    expect(result).toMatchObject({ uid: "user-001" });
    expect(setSessionCookie).toHaveBeenCalled();
    expect(clearAllAuthCookies).not.toHaveBeenCalled();
  });
});
