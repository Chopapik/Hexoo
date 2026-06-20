import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: { from: database.from, rpc: vi.fn() },
}));

import { LikeSupabaseRepository } from "@/features/likes/api/repositories/like.supabase.repository";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260620200000_batch_5_like_target_state.sql"),
  "utf8",
).toLowerCase();

describe("like parent-type contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it("includes collection in unique identity and generated id", () => {
    expect(migration).toContain("unique (parent_collection, parent_id, user_id)");
    expect(migration).toMatch(/p_parent_collection \|\| '_' \|\| p_parent_id/);
  });

  it("filters enrichment reads by parent collection", async () => {
    const chain = {
      select: vi.fn(),
      eq: vi.fn(),
      in: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    database.from.mockReturnValue(chain);

    await new LikeSupabaseRepository().getLikesForParents(
      "user-1",
      "comments",
      ["shared-id"],
    );

    expect(chain.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(chain.eq).toHaveBeenCalledWith("parent_collection", "comments");
  });

  it("reconciles a non-negative counter for the selected parent type", () => {
    expect(migration).toMatch(/greatest\(0,[\s\S]*count\(\*\)/);
    expect(migration).toContain("parent_collection = p_parent_collection");
  });
});
