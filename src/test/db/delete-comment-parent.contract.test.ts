import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260619220000_batch_4_comment_integrity.sql"),
  "utf8",
).toLowerCase();

describe("delete comment parent SQL contract", () => {
  it("locks and reads the real parent before deleting", () => {
    expect(migration).toMatch(
      /select[\s\S]*post_id[\s\S]*from public\.comments[\s\S]*where id = p_comment_id[\s\S]*for update/,
    );
  });

  it("rejects a supplied parent that differs from the stored parent", () => {
    expect(migration).toContain("p_post_id is distinct from v_post_id");
    expect(migration).toContain("does not belong to post");
  });

  it("raises for a nonexistent or already-deleted comment", () => {
    expect(migration).toMatch(/if not found then[\s\S]*comment %[\s\S]*not found/);
  });
});
