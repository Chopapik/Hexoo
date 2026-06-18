import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/types/user.type";
import { AdminService } from "../admin.service";
import type { SessionData } from "@/features/me/me.type";
import type { UserEntity } from "@/features/users/types/user.entity";

vi.mock("@/features/auth/api/repositories", () => ({
  authRepository: {
    deleteUser: vi.fn(async () => undefined),
    updateUser: vi.fn(async () => undefined),
  },
}));

vi.mock("@/features/users/api/repositories", () => ({
  userRepository: {
    deleteUser: vi.fn(async () => undefined),
    getAllUsers: vi.fn(async () => []),
    updateUser: vi.fn(async () => undefined),
  },
}));

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(async () => undefined),
}));

import { authRepository } from "@/features/auth/api/repositories";
import { userRepository } from "@/features/users/api/repositories";

function session(uid = "admin-001"): SessionData {
  return {
    uid,
    email: `${uid}@example.test`,
    name: "Admin",
    role: UserRole.Admin,
  };
}

function admin(
  uid: string,
  overrides: Partial<UserEntity> = {},
): UserEntity {
  return {
    uid,
    email: `${uid}@example.test`,
    name: uid,
    hasUsername: true,
    role: UserRole.Admin,
    createdAt: new Date(),
    lastOnline: new Date(),
    isActive: true,
    isBanned: false,
    ...overrides,
  };
}

describe("ADMIN-LAST-ADMIN-001", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prevents the only active unbanned admin from deleting self before Auth delete", async () => {
    vi.mocked(userRepository.getAllUsers).mockResolvedValue([admin("admin-001")]);

    await expect(new AdminService(session()).adminDeleteUser("admin-001"))
      .rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(authRepository.deleteUser).not.toHaveBeenCalled();
    expect(userRepository.deleteUser).not.toHaveBeenCalled();
  });

  it("prevents deleting the only active unbanned admin by another admin", async () => {
    vi.mocked(userRepository.getAllUsers).mockResolvedValue([admin("admin-002")]);

    await expect(new AdminService(session("admin-001")).adminDeleteUser("admin-002"))
      .rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(authRepository.deleteUser).not.toHaveBeenCalled();
  });

  it("prevents demoting the only active unbanned admin", async () => {
    vi.mocked(userRepository.getAllUsers).mockResolvedValue([admin("admin-001")]);

    await expect(
      new AdminService(session()).adminUpdateUserAccount("admin-001", {
        role: UserRole.User,
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(userRepository.updateUser).not.toHaveBeenCalled();
  });

  it("allows delete or demotion when another active unbanned admin remains", async () => {
    vi.mocked(userRepository.getAllUsers).mockResolvedValue([
      admin("admin-001"),
      admin("admin-002"),
    ]);

    await expect(
      new AdminService(session("admin-001")).adminUpdateUserAccount("admin-002", {
        role: UserRole.User,
      }),
    ).resolves.toBeUndefined();

    expect(userRepository.updateUser).toHaveBeenCalledWith("admin-002", {
      role: UserRole.User,
    });
  });

  it("does not count banned or inactive admins as remaining active admins", async () => {
    vi.mocked(userRepository.getAllUsers).mockResolvedValue([
      admin("admin-001"),
      admin("admin-002", { isBanned: true }),
      admin("admin-003", { isActive: false }),
    ]);

    await expect(new AdminService(session()).adminDeleteUser("admin-001"))
      .rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
