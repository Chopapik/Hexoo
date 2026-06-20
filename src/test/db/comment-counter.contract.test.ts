import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260619220000_batch_4_comment_integrity.sql"),
  "utf8",
).toLowerCase();

describe("visible comment counter SQL contract", () => {
  it("reconciles comments_count to exactly the visible comment rows", () => {
    expect(migration).toContain("create constraint trigger sync_visible_comment_count");
    expect(migration).toMatch(/count\(\*\)[\s\S]*is_pending = false/);
    expect(migration).toContain("deferrable initially deferred");
  });

  it("covers insert, status transition, parent transition, and delete", () => {
    expect(migration).toMatch(/after insert or update or delete on public\.comments/);
    expect(migration).toContain("old.post_id is distinct from new.post_id");
  });
});
