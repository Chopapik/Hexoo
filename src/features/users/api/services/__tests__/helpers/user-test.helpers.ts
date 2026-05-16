import { expect, vi } from "vitest";
import type { ErrorCode } from "@/lib/AppError";
import { AppError } from "@/lib/AppError";
import type { SessionData } from "@/features/me/me.type";
import type { UserRepository } from "../../../repositories/user.repository.interface";
import { UserRole } from "../../../../types/user.type";
import type { UserEntity } from "../../../../types/user.entity";

export function createMockUser(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    uid: "user-1",
    name: "Test User",
    hasUsername: true,
    email: "test@example.com",
    role: UserRole.User,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    lastOnline: new Date("2024-01-01T12:00:00Z"),
    isBanned: false,
    ...overrides,
  };
}

export function createMockSession(
  role: UserRole = UserRole.Moderator,
  overrides: Partial<SessionData> = {},
): SessionData {
  return {
    uid: "mod-1",
    email: "mod@example.com",
    name: "Moderator",
    role,
    ...overrides,
  };
}

export function createMockUserRepository(
  overrides: Partial<UserRepository> = {},
): UserRepository {
  return {
    createUser: vi.fn(),
    getUserByUid: vi.fn(),
    getUsersByIds: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    updateUserRestriction: vi.fn(),
    createOAuthPendingUser: vi.fn(),
    getAllUsers: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
    ...overrides,
  } as UserRepository;
}

export async function expectAppError(
  run: () => Promise<unknown>,
  code: ErrorCode,
): Promise<AppError> {
  try {
    await run();
    expect.unreachable("Expected AppError to be thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe(code);
    return error as AppError;
  }
}
