import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleError } from "@/lib/http/responseHelpers";
import { SESSION_COOKIE_NAME } from "@/features/auth/api/utils/session.cookies";
import {
  createRouteRequest,
  expectApiErrorEnvelope,
  expectStatus,
  invokeRoute,
  readJsonResponse,
  readRouteResponse,
  type RouteHandler,
} from "@/test/helpers/apiRouteHarness";
import { sessionFixtures } from "@/test/helpers/sessionFixtures";
import { apiSchemaMatrix, deferredContractViolations } from "./apiSchemaMatrix";

vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: vi.fn((meta: unknown) =>
    meta ? "https://img.example.test/avatar.png" : undefined,
  ),
}));

vi.mock("@/features/users/api/services", () => ({
  getUserProfile: vi.fn(),
  getUsersByIds: vi.fn(),
  touchLastOnline: vi.fn(),
}));

vi.mock("@/features/auth/api/utils/session-user.service", () => ({
  getOptionalUserFromSession: vi.fn(),
  getUserFromSession: vi.fn(),
}));

vi.mock("@/features/posts/api/services", () => ({
  createPost: vi.fn(),
  getPosts: vi.fn(),
}));

import {
  getUserProfile,
  getUsersByIds,
  touchLastOnline,
} from "@/features/users/api/services";
import {
  getOptionalUserFromSession,
  getUserFromSession,
} from "@/features/auth/api/utils/session-user.service";
import { createPost, getPosts } from "@/features/posts/api/services";
import { POST as postUsersByIds } from "@/app/api/users/by-ids/route";
import { GET as getUserProfileRoute } from "@/app/api/user/profile/[uid]/route";
import {
  GET as getPostsRoute,
  POST as postPostsRoute,
} from "@/app/api/posts/route";
import { POST as postLastOnlineRoute } from "@/app/api/auth/last-online/route";

describe("CLIENT-API-SCHEMA-MATRIX-001 api schema matrix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("CLIENT-API-SCHEMA-MATRIX-001 defines extensible entries with contract ids", () => {
    expect(apiSchemaMatrix).toHaveLength(5);
    expect(apiSchemaMatrix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          contractId: "CLIENT-API-SCHEMA-MATRIX-001",
          route: "/api/users/by-ids",
          bodyEncoding: "json",
        }),
        expect.objectContaining({
          contractId: "CLIENT-API-SCHEMA-MATRIX-001",
          route: "/api/posts",
          bodyEncoding: "formData",
        }),
        expect.objectContaining({
          contractId: "CLIENT-API-SCHEMA-MATRIX-001",
          route: "/api/auth/last-online",
          expectedSuccessStatus: 204,
        }),
      ]),
    );
  });

  it("CLIENT-API-SCHEMA-MATRIX-001 drives a JSON route without network", async () => {
    vi.mocked(getUsersByIds).mockResolvedValue({
      "user-001": { name: "Regular User", avatarMeta: null },
    });

    const response = await invokeRoute(postUsersByIds, {
      method: "POST",
      url: "/api/users/by-ids",
      body: { type: "json", value: { uids: ["user-001"] } },
    });

    expectStatus(response, 200);
    expect(getUsersByIds).toHaveBeenCalledWith(["user-001"]);
    await expect(readJsonResponse(response)).resolves.toMatchObject({
      ok: true,
      data: {
        users: [
          {
            uid: "user-001",
            name: "Regular User",
          },
        ],
      },
    });
  });

  it("CLIENT-API-SCHEMA-MATRIX-001 drives a route without body", async () => {
    vi.mocked(getUserProfile).mockResolvedValue({
      user: {
        uid: "user-001",
        name: "Regular User",
        avatarUrl: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        lastOnline: new Date("2026-01-02T00:00:00.000Z"),
      },
    });

    const response = await invokeRoute(getUserProfileRoute, {
      method: "GET",
      url: "/api/user/profile/user-001",
      params: { uid: "user-001" },
    });

    expectStatus(response, 200);
    expect(getUserProfile).toHaveBeenCalledWith("user-001");
    await expect(readJsonResponse(response)).resolves.toMatchObject({
      ok: true,
      data: {
        user: {
          uid: "user-001",
          name: "Regular User",
        },
      },
    });
  });

  it("CLIENT-API-SCHEMA-MATRIX-001 preserves query parameters", async () => {
    vi.mocked(getOptionalUserFromSession).mockResolvedValue(null);
    vi.mocked(getPosts).mockResolvedValue({
      posts: [],
      nextCursor: "cursor-2",
    });

    const response = await invokeRoute(getPostsRoute, {
      method: "GET",
      url: "/api/posts",
      query: { limit: 2, startAfter: "cursor-1" },
    });

    expectStatus(response, 200);
    expect(getPosts).toHaveBeenCalledWith(null, 2, "cursor-1");
    await expect(readJsonResponse(response)).resolves.toMatchObject({
      ok: true,
      data: {
        posts: [],
        nextCursor: "cursor-2",
      },
    });
  });

  it("CLIENT-API-SCHEMA-MATRIX-001 sends FormData without forcing JSON", async () => {
    vi.mocked(getUserFromSession).mockResolvedValue(sessionFixtures.user);
    vi.mocked(createPost).mockResolvedValue({
      post: {
        id: "post-001",
      },
    });

    const formData = new FormData();
    const imageFile = new File(["image"], "image.png", { type: "image/png" });
    formData.set("text", "hello from form");
    formData.set("youtubeUrl", "https://youtu.be/example");
    formData.set("imageFile", imageFile);

    const response = await invokeRoute(postPostsRoute, {
      method: "POST",
      url: "/api/posts",
      body: { type: "formData", value: formData },
    });

    expectStatus(response, 201);
    expect(createPost).toHaveBeenCalledWith(
      sessionFixtures.user,
      expect.objectContaining({
        text: "hello from form",
        youtubeUrl: "https://youtu.be/example",
      }),
    );
    await expect(readJsonResponse(response)).resolves.toMatchObject({
      ok: true,
      data: {
        post: {
          id: "post-001",
        },
      },
    });
  });

  it("CLIENT-API-SCHEMA-MATRIX-001 preserves cookies and parses 204 as null", async () => {
    vi.mocked(getUserFromSession).mockResolvedValue(sessionFixtures.user);
    vi.mocked(touchLastOnline).mockResolvedValue(undefined);

    const response = await invokeRoute(postLastOnlineRoute, {
      method: "POST",
      url: "/api/auth/last-online",
      query: { force: 1 },
      cookies: {
        [SESSION_COOKIE_NAME]: "user-001",
      },
    });

    expectStatus(response, 204);
    expect(getUserFromSession).toHaveBeenCalled();
    expect(touchLastOnline).toHaveBeenCalledWith("user-001", 0);
    await expect(readRouteResponse(response)).resolves.toMatchObject({
      status: 204,
      body: null,
      text: "",
    });
  });

  it("CLIENT-API-SCHEMA-MATRIX-001 supports explicit empty body requests", () => {
    const request = createRouteRequest({
      method: "POST",
      url: "/api/test-empty",
      body: { type: "empty" },
    });

    expect(request.headers.get("content-type")).toBeNull();
  });

  it("CLIENT-API-SCHEMA-MATRIX-001 asserts controlled error envelopes", async () => {
    const handler: RouteHandler = async () =>
      handleError("VALIDATION_ERROR", "Invalid test payload", undefined, 400);

    const response = await invokeRoute(handler, {
      method: "POST",
      url: "/api/test-error",
      body: { type: "json", value: { invalid: true } },
    });

    expectStatus(response, 400);
    const body = await readJsonResponse(response);
    expectApiErrorEnvelope(body, "VALIDATION_ERROR");
  });

  it.todo(
    `${deferredContractViolations[0].contractId} -> Batch ${deferredContractViolations[0].batch}`,
  );

  it.todo(
    `${deferredContractViolations[1].contractId} -> Batch ${deferredContractViolations[1].batch}`,
  );
});
