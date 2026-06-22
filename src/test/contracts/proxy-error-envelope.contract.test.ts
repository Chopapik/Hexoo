import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/api/services/session.service", () => ({
  isUserAuthenticated: vi.fn(),
}));

vi.mock("@/features/posts/api/services", () => ({
  createPost: vi.fn(),
  getPosts: vi.fn(),
}));

import { isUserAuthenticated } from "@/features/auth/api/services/session.service";
import { createPost } from "@/features/posts/api/services";
import { proxy } from "@/proxy";

describe("CLIENT-ERROR-ENVELOPE-001 protected proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isUserAuthenticated).mockResolvedValue(false);
  });

  it("rejects a protected mutation with the stable envelope before downstream work", async () => {
    const response = await proxy(
      new NextRequest("http://localhost/api/posts", { method: "POST" }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "AUTH_REQUIRED",
        message: "Authentication required",
      },
    });
    expect(createPost).not.toHaveBeenCalled();
    expect(response.cookies.get("session")).toMatchObject({ value: "" });
    expect(response.cookies.get("refresh")).toMatchObject({ value: "" });
  });
});
