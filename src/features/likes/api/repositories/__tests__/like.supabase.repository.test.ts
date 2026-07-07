import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: {
    rpc: mocks.rpc,
    from: mocks.from,
  },
}));

import { LikeSupabaseRepository } from "../like.supabase.repository";

describe("LikeSupabaseRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends exact set-like RPC args and returns authoritative data", async () => {
    mocks.rpc.mockResolvedValue({
      data: { liked: false, likesCount: 17 },
      error: null,
    });

    const result = await new LikeSupabaseRepository().setLikeState({
      userId: "user-like-rpc-1",
      parentId: "post-like-rpc-1",
      parentCollection: "posts",
      liked: false,
    });

    expect(mocks.rpc).toHaveBeenCalledWith("set_like_state_tx", {
      p_user_id: "user-like-rpc-1",
      p_parent_id: "post-like-rpc-1",
      p_parent_collection: "posts",
      p_liked: false,
    });
    expect(result).toEqual({ liked: false, likesCount: 17 });
  });

  it("maps not-found RPC errors to NOT_FOUND", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: "parent post not found" },
    });

    await expect(
      new LikeSupabaseRepository().setLikeState({
        userId: "user-missing-parent-1",
        parentId: "missing-parent-1",
        parentCollection: "comments",
        liked: true,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid set-like RPC response data", async () => {
    mocks.rpc.mockResolvedValue({
      data: { liked: "true", likesCount: "18" },
      error: null,
    });

    await expect(
      new LikeSupabaseRepository().setLikeState({
        userId: "user-invalid-rpc-1",
        parentId: "comment-invalid-rpc-1",
        parentCollection: "comments",
        liked: true,
      }),
    ).rejects.toMatchObject({ code: "DB_ERROR" });
  });

  it("skips parent lookup queries for empty parent IDs", async () => {
    await expect(
      new LikeSupabaseRepository().getLikesForParents(
        "user-empty-parents-1",
        "posts",
        [],
      ),
    ).resolves.toEqual([]);

    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("filters parent lookup by user, parent collection, and parent IDs", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      in: vi.fn(),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.in.mockResolvedValue({
      data: [{ parent_id: "comment-liked-2" }, { parent_id: "comment-liked-3" }],
      error: null,
    });
    mocks.from.mockReturnValue(query);

    const result = await new LikeSupabaseRepository().getLikesForParents(
      "user-read-likes-1",
      "comments",
      ["comment-liked-1", "comment-liked-2", "comment-liked-3"],
    );

    expect(mocks.from).toHaveBeenCalledWith("likes");
    expect(query.select).toHaveBeenCalledWith("parent_id");
    expect(query.eq).toHaveBeenNthCalledWith(1, "user_id", "user-read-likes-1");
    expect(query.eq).toHaveBeenNthCalledWith(
      2,
      "parent_collection",
      "comments",
    );
    expect(query.in).toHaveBeenCalledWith("parent_id", [
      "comment-liked-1",
      "comment-liked-2",
      "comment-liked-3",
    ]);
    expect(result).toEqual(["comment-liked-2", "comment-liked-3"]);
  });
});
