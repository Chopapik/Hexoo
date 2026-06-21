import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260620230000_complete_batches_3_4_contracts.sql",
  ),
  "utf8",
).toLowerCase();

describe("completed Batch 3 moderation DB contracts", () => {
  it("persists one canonical status model for posts and comments", () => {
    expect(migration).toContain("create type public.content_status");
    expect(migration).toContain("'visible', 'pending', 'quarantined', 'rejected'");
    expect(migration).toMatch(/alter table public\.posts[\s\S]*add column if not exists status/);
    expect(migration).toMatch(/alter table public\.comments[\s\S]*add column if not exists status/);
  });

  it("writes AI evidence through the same row transaction", () => {
    expect(migration).toContain("apply_content_status_and_audit");
    expect(migration).toContain("new.moderation_context := null");
    expect(migration).toMatch(/before insert or update on public\.posts/);
    expect(migration).toMatch(/insert into public\.moderation_logs/);
    expect(migration).toContain("previous_status");
    expect(migration).toContain("new_status");
  });

  it("derives moderator status from the transactional audit row", () => {
    expect(migration).toContain("apply_moderation_log_content_status");
    expect(migration).toContain("after insert on public.moderation_logs");
    expect(migration).toContain("'quarantined'");
  });

  it("guards duplicate moderator transition logs in the database", () => {
    expect(migration).toContain("moderator_review_content_guarded_tx");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("jsonb_build_object('noop', true)");
    expect(migration).toMatch(
      /set previous_status = v_status,[\s\S]*new_status = v_target_status/,
    );
  });
});
