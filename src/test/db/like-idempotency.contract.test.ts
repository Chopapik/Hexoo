import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260620200000_batch_5_like_target_state.sql"),
  "utf8",
).toLowerCase();

describe("target-state like SQL contract", () => {
  it("uses an explicit boolean target and removes the blind toggle RPC", () => {
    expect(migration).toMatch(/set_like_state_tx\([\s\S]*p_liked boolean/);
    expect(migration).toContain("drop function if exists public.toggle_like_tx");
  });

  it("changes counters only when the like row changes", () => {
    expect(migration).toContain("on conflict (parent_collection, parent_id, user_id) do nothing");
    expect(migration).toContain("get diagnostics v_changed = row_count");
    expect(migration).toMatch(
      /if v_changed > 0 or v_stored_count is distinct from v_likes_count then[\s\S]*set likes_count/,
    );
  });

  it("returns authoritative liked and likesCount", () => {
    expect(migration).toContain("jsonb_build_object");
    expect(migration).toContain("'liked', p_liked");
    expect(migration).toContain("'likescount', v_likes_count");
  });
});
