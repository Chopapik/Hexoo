import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260623090000_batch_9_db_security.sql",
  ),
  "utf8",
).toLowerCase();

const securedTables = [
  "users",
  "posts",
  "comments",
  "likes",
  "post_reports",
  "comment_reports",
  "moderation_logs",
  "activity_logs",
  "account_deletion_jobs",
];

const backendRpcs = [
  "set_like_state_tx",
  "create_comment_tx",
  "delete_comment_tx",
  "moderator_block_user_tx",
  "moderator_unblock_user_tx",
  "moderator_review_post_tx",
  "moderator_review_comment_tx",
  "moderator_review_content_guarded_tx",
  "begin_account_deletion",
  "complete_account_deletion_step",
  "record_account_deletion_failure",
];

describe("Batch 9 RLS and RPC exposure contract", () => {
  it("enables RLS and service-role policies for every public application table", () => {
    for (const table of securedTables) {
      expect(migration).toContain(
        `alter table public.${table} enable row level security`,
      );
      expect(migration).toContain(`${table}_service_role_all`);
      expect(migration).toContain(`on public.${table} for all to service_role`);
    }
  });

  it("revokes direct table mutation privileges from browser roles", () => {
    expect(migration).toContain(
      "revoke all on all tables in schema public from public, anon, authenticated",
    );
    expect(migration).toContain(
      "alter default privileges in schema public\n  revoke all on tables from public, anon, authenticated",
    );
    expect(migration).toContain(
      "grant all on all tables in schema public to service_role",
    );
  });

  it("restricts backend and actor-bearing RPCs to service_role execution", () => {
    expect(migration).toContain(
      "revoke execute on all functions in schema public from public, anon, authenticated",
    );

    for (const rpc of backendRpcs) {
      expect(migration).toContain(`grant execute on function public.${rpc}`);
      expect(migration).toContain("to service_role");
    }
  });

  it("documents the actor-forgery boundary as service-role-only", () => {
    expect(migration).toContain("actor-bearing parameters");
    expect(migration).toContain("execute is restricted to the backend service role");
  });
});
