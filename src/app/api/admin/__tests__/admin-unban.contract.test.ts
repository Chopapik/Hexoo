import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/types/user.type";
import type { SessionData } from "@/features/me/me.type";
import { invokeRoute } from "@/test/helpers/apiRouteHarness";

vi.mock("@/features/auth/api/utils/session-user.service", () => ({
  getUserFromSession: vi.fn(),
  getAdminFromSession: vi.fn(),
}));

vi.mock("@/features/auth/api/repositories", () => ({
  authRepository: {
    updateUser: vi.fn(async () => undefined),
  },
}));

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(async () => undefined),
}));

vi.mock("@/features/users/api/repositories", () => ({
  userRepository: {
    getAllUsers: vi.fn(async () => []),
    getUserByUid: vi.fn(async () => null),
    unblockUser: vi.fn(async () => undefined),
  },
}));

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: {
    rpc: vi.fn(async () => ({ data: {}, error: null })),
    from: vi.fn(() => ({
      insert: vi.fn(async () => ({ error: null })),
    })),
  },
}));

import { createAppError } from "@/lib/AppError";
import {
  getAdminFromSession,
} from "@/features/auth/api/utils/session-user.service";
import { userRepository } from "@/features/users/api/repositories";
import { authRepository } from "@/features/auth/api/repositories";
import { adminUnblockUser } from "@/features/admin/api/services";
import { PUT as putAdminUnblockRoute } from "../user/[uid]/unblock/route";

function session(role: UserRole): SessionData {
  return {
    uid: `${role}-001`,
    email: `${role}@example.test`,
    name: `${role} user`,
    role,
    isBanned: false,
  };
}

describe("ADMIN-AUTHZ-001 admin-only unban", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userRepository.getUserByUid).mockResolvedValue({
      uid: "target-user",
      email: "target@example.test",
      name: "Target",
      hasUsername: true,
      role: UserRole.User,
      createdAt: new Date(),
      lastOnline: new Date(),
      isActive: true,
      isBanned: true,
    });
  });

  it("allows administrator to unban ordinary user", async () => {
    vi.mocked(getAdminFromSession).mockResolvedValue(session(UserRole.Admin));

    const response = await invokeRoute(putAdminUnblockRoute, {
      method: "PUT",
      url: "/api/admin/user/target-user/unblock",
      params: { uid: "target-user" },
    });

    expect(response.status).toBe(200);
    expect(userRepository.unblockUser).toHaveBeenCalledWith("target-user");
    expect(authRepository.updateUser).toHaveBeenCalledWith("target-user", {
      disabled: false,
    });
  });

  it.each([UserRole.Moderator, UserRole.User])(
    "rejects %s unban attempts",
    async (role) => {
      vi.mocked(getAdminFromSession).mockRejectedValue(
        createAppError({
          code: "FORBIDDEN",
          message: `${role} cannot unban`,
        }),
      );

      const response = await invokeRoute(putAdminUnblockRoute, {
        method: "PUT",
        url: "/api/admin/user/target-user/unblock",
        params: { uid: "target-user" },
      });

      expect(response.status).toBe(403);
      expect(userRepository.unblockUser).not.toHaveBeenCalled();
    },
  );

  it("rejects moderator unban attempts at the admin service boundary", async () => {
    await expect(
      adminUnblockUser(session(UserRole.Moderator), "target-user"),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(userRepository.unblockUser).not.toHaveBeenCalled();
  });
});
