import { beforeEach, describe, expect, it, vi } from "vitest";
import { invokeRoute, readJsonResponse } from "@/test/helpers/apiRouteHarness";
import { createAppError } from "@/lib/AppError";
import { UserRole } from "@/features/users/types/user.type";
import { RegisterUserUseCase } from "@/features/auth/api/services/use-cases/register-user.use-case";
import { AuthSessionMapper } from "@/features/auth/api/services/auth.session.mapper";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";

vi.mock("@/lib/recaptcha", () => ({
  verifyRecaptchaToken: vi.fn(async () => true),
}));

vi.mock("@/features/auth/api/services", () => ({
  registerUser: vi.fn(async () => ({ user: { uid: "auth-uid-001" } })),
}));

vi.mock("@/features/auth/api/utils/session.cookies", () => ({
  setSessionCookie: vi.fn(async () => undefined),
  setRefreshCookie: vi.fn(async () => undefined),
}));

vi.mock("@/features/auth/api/utils/checkUsernameUnique", () => ({
  isUsernameTaken: vi.fn(async () => false),
}));

vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: vi.fn(() => undefined),
}));

import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { registerUser } from "@/features/auth/api/services";
import { POST as registerRoute } from "../register/route";

function authRepository(): AuthRepository {
  return {
    verifyIdToken: vi.fn(async () => ({
      uid: "auth-uid-001",
      email: "registered@example.test",
    })),
    verifyPassword: vi.fn(),
    signInWithPassword: vi.fn(),
    createSessionCookie: vi.fn(async () => "session-cookie"),
    refreshSession: vi.fn(),
    getUserByEmail: vi.fn(),
    deleteUser: vi.fn(),
    updateUser: vi.fn(),
    createUser: vi.fn(),
  };
}

function userRepository(): UserRepository {
  return {
    createUser: vi.fn(async () => undefined),
    createOAuthPendingUser: vi.fn(),
    getUserByUid: vi.fn(async () => ({
      uid: "auth-uid-001",
      email: "registered@example.test",
      name: "Alice",
      hasUsername: true,
      role: UserRole.User,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      lastOnline: new Date("2026-01-01T00:00:00.000Z"),
      isBanned: false,
    })),
    getUsersByIds: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
    updateUserRestriction: vi.fn(),
    getAllUsers: vi.fn(),
    deleteUser: vi.fn(),
    updateUser: vi.fn(),
  };
}

describe("AUTH-REGISTRATION-PROFILE-001 registration route and profile safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyRecaptchaToken).mockResolvedValue(true);
    vi.mocked(registerUser).mockResolvedValue({
      user: { uid: "auth-uid-001" },
    } as Awaited<ReturnType<typeof registerUser>>);
  });

  it("accepts register_confirm reCAPTCHA and then passes only registration fields to the service", async () => {
    const response = await invokeRoute(registerRoute, {
      method: "POST",
      url: "/api/auth/register",
      body: {
        type: "json",
        value: {
          idToken: "auth-token",
          refreshToken: "refresh-token",
          email: "registered@example.test",
          name: "Alice",
          recaptchaToken: "recaptcha-token",
          uid: "client-uid",
          role: "admin",
          isBanned: true,
          is_banned: true,
          bannedBy: "client",
          banned_by: "client",
          isRestricted: true,
          is_restricted: true,
        },
      },
    });

    expect(response.status).toBe(201);
    expect(verifyRecaptchaToken).toHaveBeenCalledWith(
      "recaptcha-token",
      expect.objectContaining({ expectedAction: "register_confirm" }),
    );
    expect(registerUser).toHaveBeenCalledWith({
      idToken: "auth-token",
      refreshToken: "refresh-token",
      email: "registered@example.test",
      name: "Alice",
    });
    expect(JSON.stringify(vi.mocked(registerUser).mock.calls[0][0])).not.toMatch(
      /client-uid|admin|isBanned|is_banned|bannedBy|banned_by|isRestricted|is_restricted/,
    );
    await expect(readJsonResponse(response)).resolves.toMatchObject({
      ok: true,
    });
  });

  it("rejects a token for the wrong action before registration reaches the use case", async () => {
    vi.mocked(verifyRecaptchaToken).mockImplementationOnce(
      async (_token, { expectedAction }) => {
        if (expectedAction !== "register") {
          throw createAppError({
            code: "FORBIDDEN",
            message: "recaptcha action mismatch",
          });
        }

        return true;
      },
    );

    const response = await invokeRoute(registerRoute, {
      method: "POST",
      url: "/api/auth/register",
      body: {
        type: "json",
        value: {
          idToken: "auth-token",
          refreshToken: "refresh-token",
          email: "registered@example.test",
          name: "Alice",
          recaptchaToken: "register-action-token",
        },
      },
    });

    expect(response.status).toBe(403);
    expect(verifyRecaptchaToken).toHaveBeenCalledWith(
      "register-action-token",
      expect.objectContaining({ expectedAction: "register_confirm" }),
    );
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("creates exactly one safe profile for the Auth UID with role user", async () => {
    const auth = authRepository();
    const users = userRepository();
    vi.mocked(users.getUserByUid).mockResolvedValueOnce(null);
    const useCase = new RegisterUserUseCase(
      auth,
      users,
      vi.fn(async () => undefined),
      new AuthSessionMapper(),
    );

    await useCase.execute({
      idToken: "auth-token",
      refreshToken: "refresh-token",
      email: "payload@example.test",
      name: " Alice ",
      role: "admin",
      uid: "client-uid",
      isBanned: true,
    } as Parameters<RegisterUserUseCase["execute"]>[0]);

    expect(users.createUser).toHaveBeenCalledTimes(1);
    expect(users.createUser).toHaveBeenCalledWith({
      uid: "auth-uid-001",
      name: "Alice",
      email: "registered@example.test",
      role: UserRole.User,
    });
  });
});
