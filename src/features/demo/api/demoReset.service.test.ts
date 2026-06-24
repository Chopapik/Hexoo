import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const operations: string[] = [];
  const inserts: Record<string, unknown[]> = {};
  const upserts: Record<string, unknown> = {};
  const deletedAuthUsers: string[] = [];

  const demoAuthUser = {
    id: "demo-auth-uid",
    email: "demo@hexoo.eu",
  };
  const nonDemoAuthUser = {
    id: "visitor-auth-uid",
    email: "visitor@example.test",
  };

  function createTableClient(table: string) {
    return {
      delete: vi.fn(() => ({
        not: vi.fn(async () => {
          operations.push(`delete:${table}`);
          return { count: 1, error: null };
        }),
        neq: vi.fn(async () => {
          operations.push(`delete:${table}:non-demo`);
          return { count: 1, error: null };
        }),
      })),
      insert: vi.fn(async (rows: unknown[]) => {
        operations.push(`insert:${table}`);
        inserts[table] = rows;
        return { error: null };
      }),
      upsert: vi.fn(async (row: unknown) => {
        operations.push(`upsert:${table}`);
        upserts[table] = row;
        return { error: null };
      }),
    };
  }

  const supabaseAdmin = {
    from: vi.fn(createTableClient),
    auth: {
      admin: {
        listUsers: vi.fn(async () => ({
          data: { users: [demoAuthUser, nonDemoAuthUser] },
          error: null,
        })),
        updateUserById: vi.fn(async () => ({ error: null })),
        createUser: vi.fn(),
        deleteUser: vi.fn(async (uid: string) => {
          deletedAuthUsers.push(uid);
          return { error: null };
        }),
      },
    },
    storage: {
      from: vi.fn(() => ({
        list: vi.fn(async () => ({ data: [], error: null })),
        remove: vi.fn(async () => ({ data: [], error: null })),
      })),
    },
  };

  return {
    deletedAuthUsers,
    demoAuthUser,
    inserts,
    operations,
    supabaseAdmin,
    upserts,
  };
});

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: mocks.supabaseAdmin,
}));

vi.mock("server-only", () => ({}));

import { resetDemoData } from "./demoReset.service";

describe("demoReset.service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.operations.length = 0;
    mocks.deletedAuthUsers.length = 0;
    for (const key of Object.keys(mocks.inserts)) delete mocks.inserts[key];
    for (const key of Object.keys(mocks.upserts)) delete mocks.upserts[key];

    process.env = {
      ...originalEnv,
      IS_DEMO: "true",
      DEMO_USER_EMAIL: "demo@hexoo.eu",
      DEMO_USER_PASSWORD: "demo-password",
      DEMO_USER_DISPLAY_NAME: "Demo User",
      SUPABASE_STORAGE_BUCKET: "images",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("creates deterministic seeded demo content after cleanup", async () => {
    const summary = await resetDemoData();

    expect(summary.seed).toEqual({
      strategy: "seeded",
      postsCreated: 4,
      commentsCreated: 4,
      reactionsCreated: 0,
      seedImagesLinked: 3,
    });
    expect(summary.deleted).toMatchObject({
      comments: 1,
      posts: 1,
      users: 1,
    });
    expect(mocks.deletedAuthUsers).toEqual(["visitor-auth-uid"]);

    const posts = mocks.inserts.posts as Array<{
      id: string;
      user_id: string;
      image_url: string | null;
      status: string;
    }>;
    const comments = mocks.inserts.comments as Array<{
      id: string;
      user_id: string;
      post_id: string;
      status: string;
    }>;

    expect(posts).toHaveLength(4);
    expect(comments).toHaveLength(4);
    expect(posts.map((post) => post.id)).toEqual([
      "00000000-0000-4000-8000-000000000101",
      "00000000-0000-4000-8000-000000000102",
      "00000000-0000-4000-8000-000000000103",
      "00000000-0000-4000-8000-000000000104",
    ]);
    expect(posts.map((post) => post.image_url)).toEqual([
      "/demo-seed/post-1.jpg",
      "/demo-seed/post-2.jpg",
      "/demo-seed/post-3.jpg",
      null,
    ]);
    expect(posts.every((post) => post.user_id === mocks.demoAuthUser.id)).toBe(
      true,
    );
    expect(posts.every((post) => post.status === "visible")).toBe(true);
    expect(comments.every((comment) => comment.user_id === mocks.demoAuthUser.id))
      .toBe(true);
    expect(comments.every((comment) => comment.status === "visible")).toBe(
      true,
    );

    expect(mocks.operations.indexOf("delete:posts")).toBeLessThan(
      mocks.operations.indexOf("insert:posts"),
    );
    expect(mocks.operations.indexOf("insert:posts")).toBeLessThan(
      mocks.operations.indexOf("insert:comments"),
    );
  });
});
