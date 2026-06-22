import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const batch4Migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260619220000_batch_4_comment_integrity.sql"),
  "utf8",
).toLowerCase();

const remediationMigration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260620230000_complete_batches_3_4_contracts.sql",
  ),
  "utf8",
).toLowerCase();

describe("visible comment counter SQL contract", () => {
  it("keeps the deferred constraint trigger on comments", () => {
    expect(batch4Migration).toContain(
      "create constraint trigger sync_visible_comment_count",
    );
    expect(batch4Migration).toContain("deferrable initially deferred");
    expect(batch4Migration).toMatch(
      /after insert or update or delete on public\.comments/,
    );
  });

  it("replaces reconcile_visible_comment_count to count status = visible", () => {
    expect(remediationMigration).toContain(
      "create or replace function public.reconcile_visible_comment_count()",
    );
    expect(remediationMigration).toMatch(
      /count\(\*\)[\s\S]*where post_id = old\.post_id[\s\S]*status = 'visible'/,
    );
    expect(remediationMigration).toMatch(
      /count\(\*\)[\s\S]*where post_id = v_post_id[\s\S]*status = 'visible'/,
    );
    expect(remediationMigration).not.toMatch(
      /create or replace function public\.reconcile_visible_comment_count\(\)[\s\S]*is_pending = false/,
    );
  });

  it("covers insert, status transition, parent transition, and delete", () => {
    expect(remediationMigration).toMatch(
      /old\.status is not distinct from new\.status/,
    );
    expect(remediationMigration).toContain(
      "old.post_id is distinct from new.post_id",
    );
  });
});
