import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/types/user.type";
import type { SessionData } from "@/features/me/me.type";
import { createAppError } from "@/lib/AppError";
import {
  invokeRoute,
  readJsonResponse,
  type HttpMethod,
  type RouteHandler,
} from "@/test/helpers/apiRouteHarness";

vi.mock("@/features/activity/api/services", () => ({
  getAdminActivityLogs: vi.fn(async () => []),
  logActivity: vi.fn(async () => undefined),
}));

vi.mock("@/features/auth/api/utils/session-user.service", () => ({
  getUserFromSession: vi.fn(),
  getAdminFromSession: vi.fn(),
}));

vi.mock("@/features/auth/api/repositories", () => ({
  authRepository: {
    createUser: vi.fn(async () => ({ uid: "created-user-001" })),
    deleteUser: vi.fn(async () => undefined),
    updateUser: vi.fn(async () => undefined),
  },
}));

vi.mock("@/features/users/api/repositories", () => ({
  userRepository: {
    createUser: vi.fn(async () => undefined),
    deleteUser: vi.fn(async () => undefined),
    getAllUsers: vi.fn(async () => []),
    getUserByUid: vi.fn(async () => null),
    blockUser: vi.fn(async () => undefined),
    unblockUser: vi.fn(async () => undefined),
    updateUser: vi.fn(async () => undefined),
  },
}));

vi.mock("@/features/me/api/services", () => ({
  processAccountDeletion: vi.fn(async () => ({ state: "completed" })),
}));

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: {
    rpc: vi.fn(async () => ({ data: {}, error: null })),
    from: vi.fn(() => ({
      insert: vi.fn(async () => ({ error: null })),
    })),
  },
}));

import {
  getAdminFromSession,
} from "@/features/auth/api/utils/session-user.service";
import { userRepository } from "@/features/users/api/repositories";
import { GET as getAdminActivityLogsRoute } from "../activity-logs/route";
import { PUT as putAdminBlockRoute } from "../user/[uid]/block/route";
import { PUT as putAdminPasswordRoute } from "../user/[uid]/password/route";
import { PUT as putAdminProfileRoute } from "../user/[uid]/profile/route";
import { DELETE as deleteAdminUserRoute } from "../user/[uid]/route";
import { PUT as putAdminUnblockRoute } from "../user/[uid]/unblock/route";
import { POST as postAdminUserRoute } from "../user/route";
import { GET as getAdminUsersRoute } from "../users/route";

type AdminRouteCase = {
  name: string;
  method: HttpMethod;
  url: string;
  handler: RouteHandler<{ uid?: string }>;
  params?: { uid?: string };
  body?: unknown;
};

const adminRoutes: AdminRouteCase[] = [
  {
    name: "GET /api/admin/activity-logs",
    method: "GET",
    url: "/api/admin/activity-logs",
    handler: getAdminActivityLogsRoute,
  },
  {
    name: "PUT /api/admin/user/[uid]/block",
    method: "PUT",
    url: "/api/admin/user/target-user/block",
    handler: putAdminBlockRoute,
    params: { uid: "target-user" },
    body: { reason: "policy violation" },
  },
  {
    name: "PUT /api/admin/user/[uid]/password",
    method: "PUT",
    url: "/api/admin/user/target-user/password",
    handler: putAdminPasswordRoute,
    params: { uid: "target-user" },
    body: { newPassword: "new-password-123" },
  },
  {
    name: "PUT /api/admin/user/[uid]/profile",
    method: "PUT",
    url: "/api/admin/user/target-user/profile",
    handler: putAdminProfileRoute,
    params: { uid: "target-user" },
    body: { role: UserRole.User },
  },
  {
    name: "DELETE /api/admin/user/[uid]",
    method: "DELETE",
    url: "/api/admin/user/target-user",
    handler: deleteAdminUserRoute,
    params: { uid: "target-user" },
  },
  {
    name: "PUT /api/admin/user/[uid]/unblock",
    method: "PUT",
    url: "/api/admin/user/target-user/unblock",
    handler: putAdminUnblockRoute,
    params: { uid: "target-user" },
  },
  {
    name: "POST /api/admin/user",
    method: "POST",
    url: "/api/admin/user",
    handler: postAdminUserRoute,
    body: {
      email: "new.user@example.test",
      name: "New User",
      password: "password-123",
      role: UserRole.User,
    },
  },
  {
    name: "GET /api/admin/users",
    method: "GET",
    url: "/api/admin/users",
    handler: getAdminUsersRoute,
  },
];

function session(role: UserRole): SessionData {
  return {
    uid: `${role}-001`,
    email: `${role}@example.test`,
    name: `${role} user`,
    role,
    isBanned: false,
  };
}

async function invokeCase(routeCase: AdminRouteCase) {
  return invokeRoute(routeCase.handler, {
    method: routeCase.method,
    url: routeCase.url,
    params: routeCase.params ?? {},
    body:
      routeCase.body === undefined
        ? { type: "empty" }
        : { type: "json", value: routeCase.body },
  });
}

describe("ADMIN-AUTHZ-001 admin namespace authorization matrix", () => {
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
    vi.mocked(userRepository.getUserByUid).mockResolvedValue({
      uid: "target-user",
      email: "target@example.test",
      name: "Target",
      hasUsername: true,
      role: UserRole.User,
      createdAt: new Date(),
      lastOnline: new Date(),
      isActive: true,
      isBanned: false,
    });
  });

  for (const routeCase of adminRoutes) {
    it(`ADMIN-AUTHZ-001 blocks guest, user, and moderator for ${routeCase.name}`, async () => {
      vi.mocked(getAdminFromSession).mockRejectedValueOnce(
        createAppError({
          code: "AUTH_REQUIRED",
          message: "No session",
        }),
      );
      expect((await invokeCase(routeCase)).status).toBe(401);

      vi.mocked(getAdminFromSession).mockRejectedValueOnce(
        createAppError({
          code: "FORBIDDEN",
          message: "Admin role required",
        }),
      );
      expect((await invokeCase(routeCase)).status).toBe(403);

      vi.mocked(getAdminFromSession).mockRejectedValueOnce(
        createAppError({
          code: "FORBIDDEN",
          message: "Admin role required",
        }),
      );
      expect((await invokeCase(routeCase)).status).toBe(403);
    });

    it(`ADMIN-AUTHZ-001 lets admin pass authorization for ${routeCase.name}`, async () => {
      vi.mocked(getAdminFromSession).mockResolvedValue(session(UserRole.Admin));

      const response = await invokeCase(routeCase);

      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });
  }

  it("CLIENT-API-BLOCK-001 returns controlled validation for empty admin block body", async () => {
    vi.mocked(getAdminFromSession).mockResolvedValue(session(UserRole.Admin));

    const response = await invokeRoute(putAdminBlockRoute, {
      method: "PUT",
      url: "/api/admin/user/target-user/block",
      params: { uid: "target-user" },
      body: { type: "empty" },
    });

    expect(response.status).toBe(400);
    await expect(readJsonResponse(response)).resolves.toMatchObject({
      ok: false,
      error: { code: "VALIDATION_ERROR" },
    });
  });
});
