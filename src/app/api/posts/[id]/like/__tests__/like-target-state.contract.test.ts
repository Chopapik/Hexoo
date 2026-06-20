import { beforeEach, describe, expect, it, vi } from "vitest";
import { invokeRoute, readJsonResponse } from "@/test/helpers/apiRouteHarness";
import { UserRole } from "@/features/users/types/user.type";

const mocks = vi.hoisted(() => ({ setLikeState: vi.fn() }));

vi.mock("@/features/auth/api/utils/session-user.service", () => ({
  getUserFromSession: vi.fn(async () => ({
    uid: "user-1",
    email: "user@example.test",
    name: "User",
    role: UserRole.User,
  })),
}));
vi.mock("@/features/likes/api/services", () => ({
  setLikeState: mocks.setLikeState,
}));

import { POST } from "../route";

describe("like target-state route contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setLikeState.mockResolvedValue({ liked: true, likesCount: 4 });
  });

  it.each([true, false])("passes explicit liked=%s and returns authoritative state", async (liked) => {
    mocks.setLikeState.mockResolvedValue({
      liked,
      likesCount: liked ? 4 : 3,
    });
    const response = await invokeRoute(POST, {
      method: "POST",
      url: "/api/posts/post-1/like",
      params: { id: "post-1" },
      body: { type: "json", value: { liked } },
    });

    expect(response.status).toBe(200);
    expect(mocks.setLikeState).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "user-1" }),
      "post-1",
      "posts",
      liked,
    );
    await expect(readJsonResponse(response)).resolves.toEqual({
      ok: true,
      data: { liked, likesCount: liked ? 4 : 3 },
    });
  });

  it.each([{}, { liked: "true" }, { liked: 1 }])(
    "rejects missing or invalid target state %#",
    async (value) => {
      const response = await invokeRoute(POST, {
        method: "POST",
        url: "/api/posts/post-1/like",
        params: { id: "post-1" },
        body: { type: "json", value },
      });
      expect(response.status).toBe(400);
      expect(mocks.setLikeState).not.toHaveBeenCalled();
    },
  );

  it("rejects an empty request body as validation failure", async () => {
    const response = await invokeRoute(POST, {
      method: "POST",
      url: "/api/posts/post-1/like",
      params: { id: "post-1" },
      body: { type: "empty" },
    });
    expect(response.status).toBe(400);
    expect(mocks.setLikeState).not.toHaveBeenCalled();
  });
});
