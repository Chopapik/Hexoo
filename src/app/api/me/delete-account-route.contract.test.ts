import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { UserRole } from "@/features/users/types/user.type";
import { createAppError } from "@/lib/AppError";

vi.mock("@/features/auth/api/utils/session-user.service", () => ({
  getUserFromSession: vi.fn(),
}));
vi.mock("@/features/auth/api/utils/session.cookies", () => ({
  clearAllAuthCookies: vi.fn(async () => undefined),
}));
vi.mock("@/features/me/api/services", () => ({
  deleteAccount: vi.fn(),
}));

import { DELETE } from "./route";
import { deleteAccount } from "@/features/me/api/services";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { clearAllAuthCookies } from "@/features/auth/api/utils/session.cookies";

const session = {
  uid: "user-1",
  email: "user@example.test",
  name: "User",
  role: UserRole.User,
};

describe("DELETE /api/me Batch 7", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserFromSession).mockResolvedValue(session);
  });

  it.each([
    ["completed", 200],
    ["recovery_pending", 202],
  ] as const)("maps %s and clears both auth cookies", async (state, status) => {
    vi.mocked(deleteAccount).mockResolvedValue({ state });

    const response = await DELETE(
      new NextRequest("http://localhost/api/me", { method: "DELETE" }),
      { params: Promise.resolve({}) },
    );

    expect(response.status).toBe(status);
    expect(clearAllAuthCookies).toHaveBeenCalledOnce();
  });

  it("preserves cookies when durable deletion is rejected", async () => {
    vi.mocked(deleteAccount).mockRejectedValue(
      createAppError({ code: "FORBIDDEN", message: "last admin" }),
    );

    const response = await DELETE(
      new NextRequest("http://localhost/api/me", { method: "DELETE" }),
      { params: Promise.resolve({}) },
    );

    expect(response.status).toBe(403);
    expect(clearAllAuthCookies).not.toHaveBeenCalled();
  });
});
