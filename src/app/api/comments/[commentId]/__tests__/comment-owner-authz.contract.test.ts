import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/types/user.type";
import { createAppError } from "@/lib/AppError";
import { invokeRoute, readJsonResponse } from "@/test/helpers/apiRouteHarness";

vi.mock("@/features/auth/api/utils/session-user.service", () => ({
  getUserFromSession: vi.fn(),
}));

vi.mock("@/features/comments/api/services", () => ({
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
}));

import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { deleteComment, updateComment } from "@/features/comments/api/services";
import { DELETE, PUT } from "../route";

const ownerSession = {
  uid: "owner-1",
  email: "owner@example.test",
  name: "Owner",
  role: UserRole.User,
};

describe("AUTH-OWNER-AUTHZ-001 comment route owner boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserFromSession).mockResolvedValue(ownerSession);
    vi.mocked(updateComment).mockResolvedValue({ id: "comment-1" } as never);
    vi.mocked(deleteComment).mockResolvedValue(undefined);
  });

  it.each(["PUT", "DELETE"] as const)(
    "%s returns 401 when session is missing",
    async (method) => {
      vi.mocked(getUserFromSession).mockRejectedValueOnce(
        createAppError({ code: "AUTH_REQUIRED", message: "No session" }),
      );

      const handler = method === "PUT" ? PUT : DELETE;
      const response = await invokeRoute(handler, {
        method,
        url: "/api/comments/comment-1",
        params: { commentId: "comment-1" },
        body:
          method === "PUT"
            ? { type: "json", value: { text: "updated" } }
            : { type: "empty" },
      });

      expect(response.status).toBe(401);
      expect(updateComment).not.toHaveBeenCalled();
      expect(deleteComment).not.toHaveBeenCalled();
    },
  );

  it("PUT returns 403 for non-owner updates", async () => {
    vi.mocked(updateComment).mockRejectedValueOnce(
      createAppError({ code: "FORBIDDEN", message: "Not author of comment" }),
    );

    const response = await invokeRoute(PUT, {
      method: "PUT",
      url: "/api/comments/comment-1",
      params: { commentId: "comment-1" },
      body: { type: "json", value: { text: "updated" } },
    });

    expect(response.status).toBe(403);
    await expect(readJsonResponse(response)).resolves.toMatchObject({
      ok: false,
      error: { code: "FORBIDDEN" },
    });
  });

  it("DELETE returns 403 for non-owner deletes", async () => {
    vi.mocked(deleteComment).mockRejectedValueOnce(
      createAppError({ code: "FORBIDDEN", message: "Not author of comment" }),
    );

    const response = await invokeRoute(DELETE, {
      method: "DELETE",
      url: "/api/comments/comment-1",
      params: { commentId: "comment-1" },
      body: { type: "empty" },
    });

    expect(response.status).toBe(403);
    await expect(readJsonResponse(response)).resolves.toMatchObject({
      ok: false,
      error: { code: "FORBIDDEN" },
    });
  });

  it("lets the owner update and delete through the route", async () => {
    const putResponse = await invokeRoute(PUT, {
      method: "PUT",
      url: "/api/comments/comment-1",
      params: { commentId: "comment-1" },
      body: { type: "json", value: { text: "updated" } },
    });

    expect(putResponse.status).toBe(200);
    expect(updateComment).toHaveBeenCalledWith(ownerSession, "comment-1", {
      text: "updated",
    });

    const deleteResponse = await invokeRoute(DELETE, {
      method: "DELETE",
      url: "/api/comments/comment-1",
      params: { commentId: "comment-1" },
      body: { type: "empty" },
    });

    expect(deleteResponse.status).toBe(204);
    expect(deleteComment).toHaveBeenCalledWith(ownerSession, "comment-1");
  });
});
