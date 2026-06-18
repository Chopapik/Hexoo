import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/types/user.type";
import { AdminService } from "../admin.service";
import type { SessionData } from "@/features/me/me.type";

vi.mock("@/features/auth/api/repositories", () => ({
  authRepository: {
    createUser: vi.fn(async () => ({ uid: "created-user-001" })),
    updateUser: vi.fn(async () => undefined),
  },
}));

vi.mock("@/features/users/api/repositories", () => ({
  userRepository: {
    createUser: vi.fn(async () => undefined),
    getAllUsers: vi.fn(async () => []),
    updateUser: vi.fn(async () => undefined),
  },
}));

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(async () => undefined),
}));

import { authRepository } from "@/features/auth/api/repositories";
import { userRepository } from "@/features/users/api/repositories";

const invalidRoles = [
  "owner",
  "superadmin",
  "ADMIN",
  "",
  null,
  undefined,
  {},
  [],
  1,
  true,
];

function session(): SessionData {
  return {
    uid: "admin-001",
    email: "admin@example.test",
    name: "Admin",
    role: UserRole.Admin,
  };
}

describe("ADMIN-ROLE-VALIDATION-001", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userRepository.getAllUsers).mockResolvedValue([
      {
        uid: "admin-001",
        email: "admin@example.test",
        name: "Admin",
        hasUsername: true,
        role: UserRole.Admin,
        createdAt: new Date(),
        lastOnline: new Date(),
        isActive: true,
        isBanned: false,
      },
      {
        uid: "target-user",
        email: "target@example.test",
        name: "Target",
        hasUsername: true,
        role: UserRole.User,
        createdAt: new Date(),
        lastOnline: new Date(),
        isActive: true,
        isBanned: false,
      },
    ]);
  });

  it.each(Object.values(UserRole))("accepts valid role %s", async (role) => {
    await expect(
      new AdminService(session()).adminUpdateUserAccount("target-user", {
        role,
      }),
    ).resolves.toBeUndefined();

    expect(userRepository.updateUser).toHaveBeenCalledWith("target-user", {
      role,
    });
  });

  it.each(invalidRoles)(
    "rejects invalid role %o before Auth or DB writes",
    async (role) => {
      await expect(
        new AdminService(session()).adminUpdateUserAccount("target-user", {
          role: role as string,
        }),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

      expect(userRepository.updateUser).not.toHaveBeenCalled();
      expect(authRepository.updateUser).not.toHaveBeenCalled();
    },
  );

  it("rejects invalid create role before Auth create", async () => {
    await expect(
      new AdminService(session()).adminCreateUserAccount({
        email: "created@example.test",
        name: "Created",
        password: "password-123",
        role: "owner" as UserRole,
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

    expect(authRepository.createUser).not.toHaveBeenCalled();
    expect(userRepository.createUser).not.toHaveBeenCalled();
  });
});
