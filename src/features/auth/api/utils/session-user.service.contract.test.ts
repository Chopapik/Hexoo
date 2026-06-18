import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/types/user.type";
import type { UserEntity } from "@/features/users/types/user.entity";

vi.mock("./session.cookies", () => ({
  getSessionCookie: vi.fn(),
}));

vi.mock("@/features/auth/api/repositories", () => ({
  authRepository: {
    verifyIdToken: vi.fn(),
  },
}));

vi.mock("@/features/users/api/repositories", () => ({
  userRepository: {
    getUserByUid: vi.fn(),
  },
}));

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: vi.fn(() => undefined),
}));

import { getSessionCookie } from "./session.cookies";
import { authRepository } from "@/features/auth/api/repositories";
import { userRepository } from "@/features/users/api/repositories";
import {
  ensureAdminSession,
  getOptionalUserFromSession,
  getUserFromSession,
} from "./session-user.service";

function user(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    uid: "user-001",
    email: "user.001@example.test",
    name: "Regular User",
    hasUsername: true,
    role: UserRole.User,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    lastOnline: new Date("2026-01-02T00:00:00.000Z"),
    isActive: true,
    isBanned: false,
    ...overrides,
  };
}

describe("AUTH-SESSION-ROLE-001 and AUTH-BAN-001 session resolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionCookie).mockResolvedValue({
      session: true,
      value: "session-token",
    });
    vi.mocked(authRepository.verifyIdToken).mockResolvedValue({
      uid: "user-001",
      email: "token-role-is-not-trusted@example.test",
    });
    vi.mocked(userRepository.getUserByUid).mockResolvedValue(user());
  });

  it("AUTH-SESSION-ROLE-001 loads UID and role from verified token plus DB profile", async () => {
    vi.mocked(userRepository.getUserByUid).mockResolvedValue(
      user({
        uid: "user-001",
        email: "db-email@example.test",
        role: UserRole.Moderator,
      }),
    );

    await expect(getUserFromSession()).resolves.toMatchObject({
      uid: "user-001",
      email: "db-email@example.test",
      role: UserRole.Moderator,
    });
  });

  it("AUTH-SESSION-ROLE-001 rejects missing DB profile instead of creating partial auth", async () => {
    vi.mocked(userRepository.getUserByUid).mockResolvedValue(null);

    await expect(getUserFromSession()).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
    });
  });

  it("AUTH-SESSION-ROLE-001 treats invalid or expired session as unauthenticated", async () => {
    vi.mocked(authRepository.verifyIdToken).mockRejectedValue(
      new Error("expired"),
    );

    await expect(getUserFromSession()).rejects.toMatchObject({
      code: "INVALID_SESSION",
    });
    await expect(getOptionalUserFromSession()).resolves.toBeNull();
  });

  it("AUTH-BAN-001 rejects a banned profile even when the session cookie is still valid", async () => {
    vi.mocked(userRepository.getUserByUid).mockResolvedValue(
      user({
        isBanned: true,
        bannedAt: new Date("2026-02-01T00:00:00.000Z"),
        bannedBy: "admin-001",
        bannedReason: "policy",
      }),
    );

    await expect(getUserFromSession()).rejects.toMatchObject({
      code: "ACCOUNT_BANNED",
    });
  });

  it("ADMIN-AUTHZ-001 rejects moderator sessions at the admin boundary", () => {
    expect(() =>
      ensureAdminSession({
        uid: "moderator-001",
        email: "moderator@example.test",
        name: "Moderator",
        role: UserRole.Moderator,
        isBanned: false,
      }),
    ).toThrow(expect.objectContaining({ code: "FORBIDDEN" }));
  });
});
