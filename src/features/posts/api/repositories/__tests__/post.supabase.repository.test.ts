import { describe, it, expect, vi, beforeEach } from "vitest";
import { PostSupabaseRepository } from "../post.supabase.repository";
import type { PostRow } from "../../../types/post.row";

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: {
    from: mockFrom,
  },
}));

vi.mock("@/features/shared/utils/dateUtils", () => ({
  parseDate: vi.fn((d: string | null | undefined) => (d ? new Date(d) : null)),
}));

type SupabaseError = { message: string } | null;

interface QueryChain {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  then: ReturnType<typeof vi.fn>;
}

function createQueryChain(): QueryChain {
  const chain: QueryChain = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    or: vi.fn(),
    upsert: vi.fn(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    then: vi.fn(),
  };

  chain.select.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.delete.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.in.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.or.mockReturnValue(chain);
  chain.upsert.mockReturnValue(chain);

  return chain;
}

function resolveChain(
  chain: QueryChain,
  result:
    | { type: "rows"; data: PostRow[] | PostRow | null; error?: SupabaseError }
    | { type: "count"; count: number; error?: SupabaseError }
    | { type: "void"; error?: SupabaseError },
) {
  if (result.type === "count") {
    chain.then.mockImplementation((onFulfilled: (value: unknown) => unknown) =>
      onFulfilled({ count: result.count, error: result.error ?? null }),
    );
    return;
  }

  if (result.type === "void") {
    chain.then.mockImplementation((onFulfilled: (value: unknown) => unknown) =>
      onFulfilled({ data: null, error: result.error ?? null }),
    );
    return;
  }

  chain.then.mockImplementation((onFulfilled: (value: unknown) => unknown) =>
    onFulfilled({
      data: result.data,
      error: result.error ?? null,
    }),
  );
}

function samplePostRow(overrides: Partial<PostRow> = {}): PostRow {
  return {
    id: "post-123",
    user_id: "user-123",
    text: "Hello world",
    likes_count: 5,
    comments_count: 2,
    created_at: "2026-05-15T16:03:00.000Z",
    updated_at: "2026-05-15T16:03:28.908Z",
    is_pending: false,
    is_nsfw: false,
    is_edited: false,
    image_meta: null,
    device: null,
    youtube_url: null,
    ...overrides,
  };
}

describe("PostSupabaseRepository", () => {
  let repository: PostSupabaseRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new PostSupabaseRepository();
  });

  describe("getPostById", () => {
    it("returns mapped PostEntity when the database returns a row", async () => {
      const fakeDbRow = samplePostRow();
      const chain = createQueryChain();
      chain.maybeSingle.mockResolvedValue({ data: fakeDbRow, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await repository.getPostById("post-123");

      expect(mockFrom).toHaveBeenCalledWith("posts");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("post-123");
      expect(result?.text).toBe("Hello world");
      expect(result?.userId).toBe("user-123");
    });

    it("returns null when the database returns no row", async () => {
      const chain = createQueryChain();
      chain.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await repository.getPostById("ghost-post");

      expect(result).toBeNull();
    });

    it("throws when Supabase returns an error", async () => {
      const chain = createQueryChain();
      chain.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: "Row not found" },
      });
      mockFrom.mockReturnValue(chain);

      await expect(repository.getPostById("ghost-post")).rejects.toThrow(
        "Row not found",
      );
    });
  });

  describe("createPost", () => {
    it("inserts row and returns id", async () => {
      const payload = { userId: "user-1", text: "New post", isNSFW: true };
      const chain = createQueryChain();
      chain.single.mockResolvedValue({ data: { id: "new-id" }, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await repository.createPost(payload);

      expect(mockFrom).toHaveBeenCalledWith("posts");
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-1",
          text: "New post",
          is_nsfw: true,
        }),
      );
      expect(result).toBe("new-id");
    });
  });

  describe("getPostsByIds", () => {
    it("returns mapped entities", async () => {
      const fakeDbRow = samplePostRow({ id: "p1" });
      const chain = createQueryChain();
      resolveChain(chain, { type: "rows", data: [fakeDbRow] });
      mockFrom.mockReturnValue(chain);

      const result = await repository.getPostsByIds(["p1"]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("p1");
    });

    it("returns empty array for empty id list without querying", async () => {
      const result = await repository.getPostsByIds([]);

      expect(result).toEqual([]);
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe("deletePost", () => {
    it("deletes by id", async () => {
      const chain = createQueryChain();
      chain.maybeSingle.mockResolvedValue({ data: { id: "p1" }, error: null });
      mockFrom.mockReturnValue(chain);

      await repository.deletePost("p1");

      expect(mockFrom).toHaveBeenCalledWith("posts");
      expect(chain.delete).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith("id", "p1");
    });
  });

  describe("getPosts", () => {
    it("queries approved posts ordered by created_at without cursor filter", async () => {
      const rows = [samplePostRow({ id: "p1" }), samplePostRow({ id: "p2" })];
      const listChain = createQueryChain();
      resolveChain(listChain, { type: "rows", data: rows });
      mockFrom.mockReturnValue(listChain);

      const result = await repository.getPosts(20);

      expect(mockFrom).toHaveBeenCalledTimes(1);
      expect(listChain.eq).toHaveBeenCalledWith("status", "visible");
      expect(listChain.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(listChain.limit).toHaveBeenCalledWith(20);
      expect(listChain.or).not.toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("p1");
    });

    it("applies cursor OR filter when startAfterId resolves", async () => {
      const rows = [samplePostRow({ id: "p3" })];
      const listChain = createQueryChain();
      const cursorChain = createQueryChain();
      resolveChain(listChain, { type: "rows", data: rows });
      cursorChain.maybeSingle.mockResolvedValue({
        data: { created_at: "2026-05-15T12:00:00.000Z", id: "cursor-id" },
        error: null,
      });

      let postsCall = 0;
      mockFrom.mockImplementation((table: string) => {
        expect(table).toBe("posts");
        postsCall += 1;
        return postsCall === 1 ? listChain : cursorChain;
      });

      const result = await repository.getPosts(10, "cursor-id");

      expect(cursorChain.eq).toHaveBeenCalledWith("id", "cursor-id");
      expect(listChain.or).toHaveBeenCalledWith(
        "created_at.lt.2026-05-15T12:00:00.000Z,and(created_at.eq.2026-05-15T12:00:00.000Z,id.lt.cursor-id)",
      );
      expect(result).toHaveLength(1);
    });

    it("skips OR filter when cursor post is missing", async () => {
      const listChain = createQueryChain();
      const cursorChain = createQueryChain();
      resolveChain(listChain, { type: "rows", data: [] });
      cursorChain.maybeSingle.mockResolvedValue({ data: null, error: null });

      let postsCall = 0;
      mockFrom.mockImplementation(() => {
        postsCall += 1;
        return postsCall === 1 ? listChain : cursorChain;
      });

      await repository.getPosts(10, "missing-cursor");

      expect(listChain.or).not.toHaveBeenCalled();
    });
  });

  describe("getPostsByUserId", () => {
    it("filters by user_id and applies cursor OR when provided", async () => {
      const rows = [samplePostRow({ id: "p-user", user_id: "user-abc" })];
      const listChain = createQueryChain();
      const cursorChain = createQueryChain();
      resolveChain(listChain, { type: "rows", data: rows });
      cursorChain.maybeSingle.mockResolvedValue({
        data: { created_at: "2026-05-10T08:00:00.000Z", id: "c1" },
        error: null,
      });

      let postsCall = 0;
      mockFrom.mockImplementation(() => {
        postsCall += 1;
        return postsCall === 1 ? listChain : cursorChain;
      });

      const result = await repository.getPostsByUserId("user-abc", 15, "c1");

      expect(listChain.eq).toHaveBeenCalledWith("user_id", "user-abc");
      expect(listChain.eq).toHaveBeenCalledWith("status", "visible");
      expect(listChain.limit).toHaveBeenCalledWith(15);
      expect(listChain.or).toHaveBeenCalledWith(
        "created_at.lt.2026-05-10T08:00:00.000Z,and(created_at.eq.2026-05-10T08:00:00.000Z,id.lt.c1)",
      );
      expect(result[0].userId).toBe("user-abc");
    });
  });

  describe("reportPost", () => {
    const reportDetails = {
      uid: "reporter-1",
      reason: "spam",
      details: "ads",
      createdAt: new Date("2026-05-16T10:00:00.000Z"),
    };

    function setupReportPostMocks(options: {
      post: PostRow | null;
      reportsCount: number;
    }) {
      const getPostChain = createQueryChain();
      const upsertChain = createQueryChain();
      const countChain = createQueryChain();
      const updateChain = createQueryChain();

      getPostChain.maybeSingle.mockResolvedValue({
        data: options.post,
        error: null,
      });
      resolveChain(upsertChain, { type: "void" });
      resolveChain(countChain, { type: "count", count: options.reportsCount });
      updateChain.maybeSingle.mockResolvedValue({
        data: options.post
          ? { ...options.post, is_pending: true }
          : null,
        error: null,
      });

      let postsCalls = 0;
      let reportsCalls = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === "posts") {
          postsCalls += 1;
          if (postsCalls === 1) return getPostChain;
          return updateChain;
        }
        if (table === "post_reports") {
          reportsCalls += 1;
          return reportsCalls === 1 ? upsertChain : countChain;
        }
        throw new Error(`Unexpected table: ${table}`);
      });

      return { getPostChain, upsertChain, countChain, updateChain };
    }

    it("returns hidden false when post does not exist", async () => {
      setupReportPostMocks({ post: null, reportsCount: 0 });

      const result = await repository.reportPost("missing", reportDetails);

      expect(result).toEqual({ hidden: false, reportsCount: 0 });
    });

    it("upserts report and returns hidden false below threshold", async () => {
      const { upsertChain, updateChain } = setupReportPostMocks({
        post: samplePostRow({ id: "post-1", is_pending: false }),
        reportsCount: 2,
      });

      const result = await repository.reportPost("post-1", reportDetails);

      expect(upsertChain.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          post_id: "post-1",
          user_id: "reporter-1",
          reason: "spam",
          details: "ads",
        }),
        {
          onConflict: "post_id,user_id",
          ignoreDuplicates: true,
        },
      );
      expect(updateChain.update).not.toHaveBeenCalled();
      expect(result).toEqual({ hidden: false, reportsCount: 2 });
    });

    it("marks post as pending when reports reach threshold of 3", async () => {
      const { updateChain } = setupReportPostMocks({
        post: samplePostRow({ id: "post-1", is_pending: false }),
        reportsCount: 3,
      });

      const result = await repository.reportPost("post-1", reportDetails);

      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_pending: true,
          status: "pending",
          moderation_context: expect.objectContaining({
            source: "user_report",
            reasonSummary: "Post hidden after multiple user reports",
          }),
        }),
      );
      expect(updateChain.eq).toHaveBeenCalledWith("id", "post-1");
      expect(result).toEqual({ hidden: true, reportsCount: 3 });
    });

    it("marks post as pending when reports exceed threshold", async () => {
      setupReportPostMocks({
        post: samplePostRow({ id: "post-1" }),
        reportsCount: 5,
      });

      const result = await repository.reportPost("post-1", reportDetails);

      expect(result).toEqual({ hidden: true, reportsCount: 5 });
    });

    it("throws when report upsert fails", async () => {
      const getPostChain = createQueryChain();
      const upsertChain = createQueryChain();
      getPostChain.maybeSingle.mockResolvedValue({
        data: samplePostRow(),
        error: null,
      });
      resolveChain(upsertChain, {
        type: "void",
        error: { message: "upsert failed" },
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "posts") return getPostChain;
        if (table === "post_reports") return upsertChain;
        throw new Error(table);
      });

      await expect(
        repository.reportPost("post-1", reportDetails),
      ).rejects.toThrow("upsert failed");
    });
  });

  describe("hasUserReportedPost", () => {
    it("returns true when report row exists", async () => {
      const chain = createQueryChain();
      chain.maybeSingle.mockResolvedValue({ data: { id: "r1" }, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await repository.hasUserReportedPost("post-1", "user-1");

      expect(mockFrom).toHaveBeenCalledWith("post_reports");
      expect(chain.eq).toHaveBeenCalledWith("post_id", "post-1");
      expect(chain.eq).toHaveBeenCalledWith("user_id", "user-1");
      expect(result).toBe(true);
    });

    it("returns false when no report row exists", async () => {
      const chain = createQueryChain();
      chain.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      expect(await repository.hasUserReportedPost("post-1", "user-1")).toBe(false);
    });
  });
});
