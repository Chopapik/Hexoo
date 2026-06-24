import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  invokeRoute,
  readJsonResponse,
} from "@/test/helpers/apiRouteHarness";

vi.mock("@/features/demo/api/demoReset.service", () => ({
  resetDemoData: vi.fn(async () => ({
    deleted: {
      accountDeletionJobs: 0,
      activityLogs: 0,
      commentReports: 0,
      comments: 0,
      likes: 0,
      moderationLogs: 0,
      postReports: 0,
      posts: 0,
      users: 0,
    },
    auth: {
      deletedUsers: 0,
      demoUser: {
        uid: "demo-auth-uid",
        email: "demo@hexoo.eu",
        created: false,
        updated: true,
      },
    },
    storage: {
      bucket: "images",
      deletedObjects: 0,
      skipped: false,
    },
    seed: {
      strategy: "seeded",
      postsCreated: 4,
      commentsCreated: 4,
      reactionsCreated: 0,
      seedImagesLinked: 3,
    },
  })),
}));

import { resetDemoData } from "@/features/demo/api/demoReset.service";
import { GET, POST } from "./route";

describe("demo reset route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      CRON_SECRET: "test-cron-secret",
      IS_DEMO: undefined,
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("rejects requests when IS_DEMO is not true", async () => {
    const response = await invokeRoute(GET, {
      method: "GET",
      url: "/api/demo/reset",
      headers: {
        Authorization: "Bearer test-cron-secret",
      },
    });
    const body = await readJsonResponse(response);

    expect(response.status).toBe(404);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "NOT_FOUND" },
    });
    expect(resetDemoData).not.toHaveBeenCalled();
  });

  it("rejects missing authorization in demo mode", async () => {
    process.env.IS_DEMO = "true";

    const response = await invokeRoute(POST, {
      method: "POST",
      url: "/api/demo/reset",
    });
    const body = await readJsonResponse(response);

    expect(response.status).toBe(401);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "INVALID_CREDENTIALS" },
    });
    expect(resetDemoData).not.toHaveBeenCalled();
  });

  it("rejects invalid authorization in demo mode", async () => {
    process.env.IS_DEMO = "true";

    const response = await invokeRoute(POST, {
      method: "POST",
      url: "/api/demo/reset",
      headers: {
        Authorization: "Bearer wrong-secret",
      },
    });
    const body = await readJsonResponse(response);

    expect(response.status).toBe(401);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "INVALID_CREDENTIALS" },
    });
    expect(resetDemoData).not.toHaveBeenCalled();
  });

  it("accepts valid authorization when IS_DEMO is true", async () => {
    process.env.IS_DEMO = "true";

    const response = await invokeRoute(POST, {
      method: "POST",
      url: "/api/demo/reset",
      headers: {
        Authorization: "Bearer test-cron-secret",
      },
    });
    const body = await readJsonResponse(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      data: {
        auth: {
          demoUser: {
            uid: "demo-auth-uid",
            email: "demo@hexoo.eu",
          },
        },
      },
    });
    expect(resetDemoData).toHaveBeenCalledTimes(1);
  });
});
