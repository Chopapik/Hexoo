import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAppError } from "@/lib/AppError";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import { UserRole } from "@/features/users/types/user.type";
import type { SessionData, UpdatePasswordData } from "../../../me.type";
import { UpdatePasswordUseCase } from "./update-password.use-case";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

vi.mock("@/features/auth/api/utils/session.cookies", () => ({
  clearAllAuthCookies: vi.fn(),
  setSessionCookie: vi.fn(),
  setRefreshCookie: vi.fn(),
}));

import {
  clearAllAuthCookies,
  setRefreshCookie,
  setSessionCookie,
} from "@/features/auth/api/utils/session.cookies";

function jwtWithIat(uid: string, iatSeconds: number): string {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString(
    "base64url",
  );
  const payload = Buffer.from(JSON.stringify({ sub: uid, iat: iatSeconds }))
    .toString("base64url");
  return `${header}.${payload}.`;
}

function createSession(overrides: Partial<SessionData> = {}): SessionData {
  return {
    uid: "user-1",
    email: "user@example.com",
    name: "User",
    role: UserRole.User,
    ...overrides,
  };
}

function createAuthRepository(): AuthRepository {
  return {
    verifyIdToken: vi.fn(),
    verifyPassword: vi.fn(),
    signInWithPassword: vi.fn(),
    createSessionCookie: vi.fn(),
    refreshSession: vi.fn(),
    getUserByEmail: vi.fn(),
    deleteUser: vi.fn(),
    updateUser: vi.fn(),
    createUser: vi.fn(),
  };
}

function createUserRepository(): UserRepository {
  return {
    createUser: vi.fn(),
    createOAuthPendingUser: vi.fn(),
    getUserByUid: vi.fn(),
    getUsersByIds: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
    updateUserRestriction: vi.fn(),
    getAllUsers: vi.fn(),
    deleteUser: vi.fn(),
    updateUser: vi.fn(),
  };
}

const validPayload: UpdatePasswordData = {
  oldPassword: "old-password",
  newPassword: "new-password",
  reNewPassword: "new-password",
};

describe("UpdatePasswordUseCase", () => {
  let authRepository: AuthRepository;
  let userRepository: UserRepository;
  let useCase: UpdatePasswordUseCase;

  beforeEach(() => {
    authRepository = createAuthRepository();
    userRepository = createUserRepository();
    useCase = new UpdatePasswordUseCase(
      createSession(),
      userRepository,
      authRepository,
    );

    vi.mocked(authRepository.verifyPassword).mockResolvedValue({
      uid: "user-1",
      email: "user@example.com",
    });
    vi.mocked(authRepository.verifyIdToken).mockResolvedValue({
      uid: "user-1",
      email: "user@example.com",
    });
    vi.mocked(authRepository.signInWithPassword).mockResolvedValue({
      access_token: jwtWithIat("user-1", 1_800_000_000),
      refresh_token: "fresh-refresh-token",
    });
    vi.mocked(authRepository.updateUser).mockResolvedValue(undefined);
    vi.mocked(userRepository.updateUser).mockResolvedValue(undefined);
  });

  it("verifies current password before setting the new password", async () => {
    await useCase.execute(validPayload);

    expect(authRepository.verifyPassword).toHaveBeenCalledWith(
      "user@example.com",
      "old-password",
    );
    expect(authRepository.updateUser).toHaveBeenCalledWith("user-1", {
      password: "new-password",
    });
    expect(authRepository.signInWithPassword).toHaveBeenCalledWith(
      "user@example.com",
      "new-password",
    );
    expect(authRepository.refreshSession).not.toHaveBeenCalled();
    expect(
      vi.mocked(authRepository.verifyPassword).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(authRepository.updateUser).mock.invocationCallOrder[0],
    );
    expect(
      vi.mocked(authRepository.updateUser).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(authRepository.signInWithPassword).mock.invocationCallOrder[0],
    );
    expect(userRepository.updateUser).toHaveBeenCalledWith("user-1", {
      sessionInvalidatedAt: expect.any(Date),
    });
    expect(setSessionCookie).toHaveBeenCalledWith(expect.any(String));
    expect(setRefreshCookie).toHaveBeenCalledWith("fresh-refresh-token");
  });

  it("does not update password when current password verification fails", async () => {
    vi.mocked(authRepository.verifyPassword).mockRejectedValue(
      createAppError({ code: "INVALID_CREDENTIALS" }),
    );

    await expect(useCase.execute(validPayload)).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });

    expect(authRepository.updateUser).not.toHaveBeenCalled();
    expect(userRepository.updateUser).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
    expect(setRefreshCookie).not.toHaveBeenCalled();
    expect(clearAllAuthCookies).not.toHaveBeenCalled();
  });

  it("does not update password when current password verifies another user", async () => {
    vi.mocked(authRepository.verifyPassword).mockResolvedValue({
      uid: "other-user",
      email: "user@example.com",
    });

    await expect(useCase.execute(validPayload)).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      data: { field: "oldPassword" },
    });

    expect(authRepository.updateUser).not.toHaveBeenCalled();
    expect(userRepository.updateUser).not.toHaveBeenCalled();
  });

  it("requires relogin without blaming the old password when fresh sign-in fails", async () => {
    vi.mocked(authRepository.signInWithPassword).mockRejectedValue(
      createAppError({ code: "INVALID_CREDENTIALS" }),
    );

    await expect(useCase.execute(validPayload)).rejects.toMatchObject({
      code: "INVALID_SESSION",
      data: { passwordChanged: true, reloginRequired: true },
    });

    expect(authRepository.updateUser).toHaveBeenCalledWith("user-1", {
      password: "new-password",
    });
    expect(authRepository.refreshSession).not.toHaveBeenCalled();
    expect(userRepository.updateUser).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
    expect(setRefreshCookie).not.toHaveBeenCalled();
    expect(clearAllAuthCookies).toHaveBeenCalledOnce();
  });

  it("does not update password when session email is missing", async () => {
    const useCaseWithoutEmail = new UpdatePasswordUseCase(
      createSession({ email: "" }),
      userRepository,
      authRepository,
    );

    await expect(useCaseWithoutEmail.execute(validPayload)).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      data: { field: "oldPassword" },
    });

    expect(authRepository.verifyPassword).not.toHaveBeenCalled();
    expect(authRepository.updateUser).not.toHaveBeenCalled();
  });
});
