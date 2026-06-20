import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: { from: database.from, rpc: database.rpc },
}));

import { PostSupabaseRepository } from "../post.supabase.repository";
import { CommentSupabaseRepository } from "@/features/comments/api/repositories/comment.supabase.repository";

function writeChain(result: { data: unknown; error: unknown }) {
  const chain = {
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
  chain.update.mockReturnValue(chain);
  chain.delete.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  return chain;
}

describe("affected row contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ["post update", () => new PostSupabaseRepository().updatePost("missing", { text: "x" })],
    ["post delete", () => new PostSupabaseRepository().deletePost("missing")],
    [
      "comment update",
      () => new CommentSupabaseRepository().updateComment("missing", { text: "x" }),
    ],
  ] as const)("does not report success for zero-row %s", async (_name, operation) => {
    database.from.mockReturnValue(writeChain({ data: null, error: null }));
    await expect(operation()).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("does not report success for zero-row comment delete", async () => {
    database.rpc.mockResolvedValue({
      data: null,
      error: { message: "Comment missing not found" },
    });
    await expect(
      new CommentSupabaseRepository().deleteComment("missing", "post-1"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
