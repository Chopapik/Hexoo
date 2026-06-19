import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAppError } from "@/lib/AppError";
import { UserRole } from "@/features/users/types/user.type";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import { RegisterUserUseCase } from "../register-user.use-case";
import { AuthSessionMapper } from "../../auth.session.mapper";
import { AdminService } from "@/features/admin/api/services";
import type { UserEntity } from "@/features/users/types/user.entity";
import {
  setRefreshCookie,
  setSessionCookie,
} from "@/features/auth/api/utils/session.cookies";
import { isUsernameTaken } from "@/features/auth/api/utils/checkUsernameUnique";

vi.mock("@/features/auth/api/utils/session.cookies", () => ({
  setSessionCookie: vi.fn(async () => undefined),
  setRefreshCookie: vi.fn(async () => undefined),
}));

vi.mock("@/features/auth/api/utils/checkUsernameUnique", () => ({
  isUsernameTaken: vi.fn(async () => false),
}));

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(async () => undefined),
}));

vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: vi.fn(() => undefined),
}));

vi.mock("@/features/auth/api/repositories", () => ({
  authRepository: {
    createUser: vi.fn(async () => ({ uid: "created-auth-uid" })),
    deleteUser: vi.fn(async () => undefined),
    updateUser: vi.fn(async () => undefined),
  },
}));

vi.mock("@/features/users/api/repositories", () => ({
  userRepository: {
    createUser: vi.fn(async () => undefined),
    updateUser: vi.fn(async () => undefined),
    getAllUsers: vi.fn(async () => []),
    deleteUser: vi.fn(async () => undefined),
    blockUser: vi.fn(async () => undefined),
    unblockUser: vi.fn(async () => undefined),
  },
}));

import { authRepository as adminAuthRepository } from "@/features/auth/api/repositories";
import { userRepository as adminUserRepository } from "@/features/users/api/repositories";

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
    deleteUser: vi.fn(async () => undefined),
    updateUser: vi.fn(),
    createUser: vi.fn(),
  };
}

function userRepository(): UserRepository {
  return {
    createUser: vi.fn(async () => undefined),
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

function userEntity(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    uid: "auth-uid-001",
    email: "registered@example.test",
    name: "Alice",
    hasUsername: true,
    role: UserRole.User,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    lastOnline: new Date("2026-01-01T00:00:00.000Z"),
    isBanned: false,
    ...overrides,
  };
}

describe("AUTH-DB-COMPENSATION-001 simple Auth-DB workflows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the Auth user when email registration profile creation fails", async () => {
    const auth = authRepository();
    const users = userRepository();
    vi.mocked(users.createUser).mockRejectedValue(new Error("db down"));

    const useCase = new RegisterUserUseCase(
      auth,
      users,
      vi.fn(async () => undefined),
      new AuthSessionMapper(),
    );

    await expect(
      useCase.execute({
        idToken: "auth-token",
        email: "registered@example.test",
        name: "Alice",
      }),
    ).rejects.toMatchObject({ code: "DB_ERROR" });

    expect(auth.deleteUser).toHaveBeenCalledWith("auth-uid-001");
  });

  it("deletes the fresh profile and Auth user when activity logging fails after DB profile creation", async () => {
    const auth = authRepository();
    const users = userRepository();
    const logActivity = vi.fn(async () => {
      throw new Error("activity down");
    });

    const useCase = new RegisterUserUseCase(
      auth,
      users,
      logActivity,
      new AuthSessionMapper(),
    );

    await expect(
      useCase.execute({
        idToken: "auth-token",
        email: "registered@example.test",
        name: "Alice",
      }),
    ).rejects.toMatchObject({
      code: "DB_ERROR",
      data: { compensation: "AUTH_AND_PROFILE_DELETED" },
    });

    expect(users.createUser).toHaveBeenCalledWith({
      uid: "auth-uid-001",
      name: "Alice",
      email: "registered@example.test",
      role: UserRole.User,
    });
    expect(users.deleteUser).toHaveBeenCalledWith("auth-uid-001");
    expect(auth.deleteUser).toHaveBeenCalledWith("auth-uid-001");
  });

  it("deletes the fresh profile and Auth user when session cookie creation fails after DB profile creation", async () => {
    const auth = authRepository();
    const users = userRepository();
    vi.mocked(auth.createSessionCookie).mockRejectedValue(
      new Error("cookie down"),
    );

    const useCase = new RegisterUserUseCase(
      auth,
      users,
      vi.fn(async () => undefined),
      new AuthSessionMapper(),
    );

    await expect(
      useCase.execute({
        idToken: "auth-token",
        email: "registered@example.test",
        name: "Alice",
      }),
    ).rejects.toMatchObject({
      code: "DB_ERROR",
      data: { compensation: "AUTH_AND_PROFILE_DELETED" },
    });

    expect(users.deleteUser).toHaveBeenCalledWith("auth-uid-001");
    expect(auth.deleteUser).toHaveBeenCalledWith("auth-uid-001");
  });

  it("deletes the fresh profile and Auth user when setting the app session cookie fails", async () => {
    const auth = authRepository();
    const users = userRepository();
    vi.mocked(setSessionCookie).mockRejectedValueOnce(
      new Error("set cookie down"),
    );

    const useCase = new RegisterUserUseCase(
      auth,
      users,
      vi.fn(async () => undefined),
      new AuthSessionMapper(),
    );

    await expect(
      useCase.execute({
        idToken: "auth-token",
        email: "registered@example.test",
        name: "Alice",
      }),
    ).rejects.toMatchObject({
      code: "DB_ERROR",
      data: { compensation: "AUTH_AND_PROFILE_DELETED" },
    });

    expect(users.deleteUser).toHaveBeenCalledWith("auth-uid-001");
    expect(auth.deleteUser).toHaveBeenCalledWith("auth-uid-001");
  });

  it("does not delete an Auth user or recreate a profile on an idempotent registration retry", async () => {
    const auth = authRepository();
    const users = userRepository();
    vi.mocked(users.getUserByUid).mockResolvedValue(userEntity());

    const useCase = new RegisterUserUseCase(
      auth,
      users,
      vi.fn(async () => undefined),
      new AuthSessionMapper(),
    );

    await expect(
      useCase.execute({
        idToken: "auth-token",
        refreshToken: "refresh-token",
        email: "registered@example.test",
        name: "",
      }),
    ).resolves.toMatchObject({
      user: {
        uid: "auth-uid-001",
        email: "registered@example.test",
        role: "user",
      },
    });

    expect(users.createUser).not.toHaveBeenCalled();
    expect(users.deleteUser).not.toHaveBeenCalled();
    expect(auth.deleteUser).not.toHaveBeenCalled();
    expect(setSessionCookie).toHaveBeenCalledWith("session-cookie");
    expect(setRefreshCookie).toHaveBeenCalledWith("refresh-token");
  });

  it("does not delete an Auth user when the existing-profile safety check fails", async () => {
    const auth = authRepository();
    const users = userRepository();
    vi.mocked(users.getUserByUid).mockRejectedValue(new Error("db read down"));

    const useCase = new RegisterUserUseCase(
      auth,
      users,
      vi.fn(async () => undefined),
      new AuthSessionMapper(),
    );

    await expect(
      useCase.execute({
        idToken: "auth-token",
        email: "registered@example.test",
        name: "Alice",
      }),
    ).rejects.toMatchObject({
      code: "DB_ERROR",
    });

    expect(users.createUser).not.toHaveBeenCalled();
    expect(users.deleteUser).not.toHaveBeenCalled();
    expect(auth.deleteUser).not.toHaveBeenCalled();
  });

  it("deletes a fresh Auth user when local username validation rejects registration", async () => {
    const auth = authRepository();
    const users = userRepository();
    vi.mocked(isUsernameTaken).mockResolvedValueOnce(true);

    const useCase = new RegisterUserUseCase(
      auth,
      users,
      vi.fn(async () => undefined),
      new AuthSessionMapper(),
    );

    await expect(
      useCase.execute({
        idToken: "auth-token",
        email: "registered@example.test",
        name: "Alice",
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      data: { compensation: "AUTH_AND_PROFILE_DELETED" },
    });

    expect(users.createUser).not.toHaveBeenCalled();
    expect(users.deleteUser).toHaveBeenCalledWith("auth-uid-001");
    expect(auth.deleteUser).toHaveBeenCalledWith("auth-uid-001");
  });

  it("reports recoverable failure when Auth cleanup after registration DB failure fails", async () => {
    const auth = authRepository();
    const users = userRepository();
    vi.mocked(users.createUser).mockRejectedValue(new Error("db down"));
    vi.mocked(auth.deleteUser).mockRejectedValue(new Error("cleanup down"));

    const useCase = new RegisterUserUseCase(
      auth,
      users,
      vi.fn(async () => undefined),
      new AuthSessionMapper(),
    );

    await expect(
      useCase.execute({
        idToken: "auth-token",
        email: "registered@example.test",
        name: "Alice",
      }),
    ).rejects.toMatchObject({
      code: "DB_ERROR",
      data: { compensation: "FAILED" },
    });
  });

  it("deletes newly created Auth user when admin DB profile create fails", async () => {
    vi.mocked(adminUserRepository.createUser).mockRejectedValue(
      createAppError({ code: "DB_ERROR", message: "db down" }),
    );

    const service = new AdminService({
      uid: "admin-001",
      email: "admin@example.test",
      name: "Admin",
      role: UserRole.Admin,
      isBanned: false,
    });

    await expect(
      service.adminCreateUserAccount({
        email: "created@example.test",
        name: "Created",
        password: "password-123",
        role: UserRole.User,
      }),
    ).rejects.toMatchObject({ code: "DB_ERROR" });

    expect(adminAuthRepository.deleteUser).toHaveBeenCalledWith(
      "created-auth-uid",
    );
    expect(adminUserRepository.updateUser).not.toHaveBeenCalled();
  });
});
