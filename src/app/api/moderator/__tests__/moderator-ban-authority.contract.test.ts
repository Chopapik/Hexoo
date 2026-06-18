import { existsSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/types/user.type";
import type { SessionData } from "@/features/me/me.type";
import { invokeRoute } from "@/test/helpers/apiRouteHarness";

vi.mock("@/features/auth/api/utils/session-user.service", () => ({
  getUserFromSession: vi.fn(),
}));

vi.mock("@/features/auth/api/repositories", () => ({
  authRepository: {
    updateUser: vi.fn(async () => undefined),
  },
}));

vi.mock("@/features/users/api/repositories", () => ({
  userRepository: {
    getUserByUid: vi.fn(async () => null),
    blockUser: vi.fn(async () => undefined),
  },
}));

vi.mock("@/features/moderation/api/services", () => ({
  getModerationService: vi.fn(() => ({
    getModerationQueueForPosts: vi.fn(),
    getModerationQueueForComments: vi.fn(),
  })),
}));

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: {
    rpc: vi.fn(async () => ({ data: {}, error: null })),
    from: vi.fn(() => ({
      insert: vi.fn(async () => ({ error: null })),
    })),
  },
}));

vi.mock("@/features/images/api/image.service", () => ({
  deleteImage: vi.fn(async () => undefined),
}));

import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { userRepository } from "@/features/users/api/repositories";
import { ModeratorService } from "@/features/moderator/api/services";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { POST as postModeratorBanRoute } from "../user/[uid]/ban/route";

function session(role: UserRole, uid = `${role}-001`): SessionData {
  return {
    uid,
    email: `${uid}@example.test`,
    name: `${role} user`,
    role,
    isBanned: false,
  };
}

function target(role: UserRole, uid = "target-user") {
  return {
    uid,
    email: `${uid}@example.test`,
    name: "Target",
    hasUsername: true,
    role,
    createdAt: new Date(),
    lastOnline: new Date(),
    isActive: true,
    isBanned: false,
  };
}

async function moderatorBan(body: unknown, uid = "target-user") {
  return invokeRoute(postModeratorBanRoute, {
    method: "POST",
    url: `/api/moderator/user/${uid}/ban`,
    params: { uid },
    body: { type: "json", value: body },
  });
}

describe("ADMIN-AUTHZ-001 moderator ban authority", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserFromSession).mockResolvedValue(
      session(UserRole.Moderator, "moderator-001"),
    );
    vi.mocked(userRepository.getUserByUid).mockResolvedValue(
      target(UserRole.User),
    );
  });

  it("allows moderator to ban an ordinary user with reason and case link outside admin namespace", async () => {
    const response = await moderatorBan({
      reason: "spam",
      moderationCaseId: "case-001",
    });

    expect(response.status).toBe(200);
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith("moderator_block_user_tx", {
      p_uid_to_block: "target-user",
      p_banned_by: "moderator-001",
      p_banned_reason: "spam",
    });
    expect(userRepository.blockUser).not.toHaveBeenCalled();
  });

  it("requires reason and moderation case or resource link", async () => {
    expect((await moderatorBan({ moderationCaseId: "case-001" })).status).toBe(
      400,
    );
    expect((await moderatorBan({ reason: "spam" })).status).toBe(400);
    expect(userRepository.blockUser).not.toHaveBeenCalled();
  });

  it.each([UserRole.Moderator, UserRole.Admin])(
    "rejects moderator ban target role %s",
    async (role) => {
      vi.mocked(userRepository.getUserByUid).mockResolvedValue(target(role));

      const response = await moderatorBan({
        reason: "spam",
        moderationCaseId: "case-001",
      });

      expect(response.status).toBe(403);
      expect(userRepository.blockUser).not.toHaveBeenCalled();
    },
  );

  it("rejects moderator self-ban", async () => {
    vi.mocked(userRepository.getUserByUid).mockResolvedValue(
      target(UserRole.User, "moderator-001"),
    );

    const response = await moderatorBan(
      {
        reason: "spam",
        moderationCaseId: "case-001",
      },
      "moderator-001",
    );

    expect(response.status).toBe(403);
  });

  it("does not expose a moderator unban route", () => {
    expect(
      existsSync(
        path.join(process.cwd(), "src/app/api/moderator/user/[uid]/unban/route.ts"),
      ),
    ).toBe(false);
  });

  it("does not expose a moderator service unban capability", () => {
    const service = new ModeratorService(
      session(UserRole.Moderator, "moderator-001"),
      {
        getModerationQueueForPosts: vi.fn(),
        getModerationQueueForComments: vi.fn(),
      },
      null,
    );

    expect("unblockUser" in service).toBe(false);
    expect(
      (service as unknown as { unblockUser?: unknown }).unblockUser,
    ).toBeUndefined();
  });

  it.todo(
    "Batch 3 verifies moderation context existence, resource linkage, and hard audit atomicity",
  );
});
