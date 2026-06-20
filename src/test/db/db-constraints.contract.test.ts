import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { COMMENT_MAX_CHARS, UpdateCommentSchema } from "@/features/comments/types/comment.dto";
import { POST_MAX_CHARS, UpdatePostSchema } from "@/features/posts/types/post.dto";

const readMigration = (name: string) =>
  readFileSync(join(process.cwd(), "supabase/migrations", name), "utf8").toLowerCase();

describe("post/comment DB constraint contract", () => {
  it("keeps the comment parent FK with explicit cascade behavior", () => {
    const comments = readMigration("20260220165703_create_comments_table.sql");
    expect(comments).toMatch(
      /post_id uuid not null references public\.posts \(id\) on delete cascade/,
    );
  });

  it("matches DB post/comment text checks to exported DTO limits", () => {
    const migration = readMigration("20260619220000_batch_4_comment_integrity.sql");
    expect(migration).toContain(`char_length(text) <= ${POST_MAX_CHARS}`);
    expect(migration).toContain(`char_length(text) <= ${COMMENT_MAX_CHARS}`);
  });

  it("enforces the same maximums for create and update schemas", () => {
    expect(UpdatePostSchema.safeParse({ text: "x".repeat(POST_MAX_CHARS + 1) }).success).toBe(false);
    expect(
      UpdateCommentSchema.safeParse({ text: "x".repeat(COMMENT_MAX_CHARS + 1) }).success,
    ).toBe(false);
  });
});
