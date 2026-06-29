import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase.database.types";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260622090000_batch_7_account_deletion.sql",
  ),
  "utf8",
).toLowerCase();

describe("Batch 7 account retention SQL contract", () => {
  it("keeps the stable user row and anonymizes private identity", () => {
    expect(migration).toContain("add column if not exists deleted_at");
    expect(migration).toContain("update public.users");
    expect(migration).toContain("display_name = ''");
    expect(migration).toContain("email = ''");
    expect(migration).toContain("session_invalidated_at = v_now");
    expect(migration).not.toMatch(/delete\s+from\s+public\.users/);
  });

  it("retains posts, comments, and all content media", () => {
    expect(migration).not.toMatch(/delete\s+from\s+public\.(posts|comments)/);
    expect(migration).not.toMatch(
      /update\s+public\.(posts|comments)[\s\S]*image_meta\s*=\s*null/,
    );
    expect(migration).toContain("avatar_meta");
    expect(migration).toContain("account_deletion_jobs");
  });

  it("atomically protects the last active non-banned admin", () => {
    expect(migration).toContain("account-deletion-admin-guard");
    expect(migration).toContain("role = 'admin'");
    expect(migration).toContain("not coalesce(is_banned, false)");
    expect(migration).toContain("raise exception 'last_active_admin'");
  });

  it("serializes content creation with the tombstone row lock", () => {
    expect(migration).toContain("for key share");
    expect(migration).toContain("posts_reject_tombstoned_author");
    expect(migration).toContain("comments_reject_tombstoned_author");
    expect(migration).toContain("raise exception 'account_deleted'");
  });

  it("stores idempotent progress for avatar and Auth cleanup", () => {
    expect(migration).toContain("avatar_deleted_at");
    expect(migration).toContain("auth_deleted_at");
    expect(migration).toContain("complete_account_deletion_step");
    expect(migration).toContain("record_account_deletion_failure");
  });
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe.skipIf(!supabaseUrl || !serviceRoleKey)(
  "Batch 7 local account retention behavior",
  () => {
    it("anonymizes the profile while retaining post/comment rows and media", async () => {
      const client = createClient<Database>(supabaseUrl!, serviceRoleKey!, {
        auth: { persistSession: false },
      });
      const uid = `batch7-${randomUUID()}`;
      const avatarMeta = {
        storageBucket: "media",
        storageLocation: "avatars",
        fileName: `${uid}.webp`,
        downloadToken: "avatar-token",
        contentType: "image/webp",
        sizeBytes: 10,
      };
      const postMeta = {
        ...avatarMeta,
        storageLocation: "posts",
        fileName: `${uid}-post.webp`,
      };
      const commentMeta = {
        ...avatarMeta,
        storageLocation: "comments",
        fileName: `${uid}-comment.webp`,
      };
      let postId: string | null = null;
      let commentId: string | null = null;

      try {
        const { error: userError } = await client.from("users").insert({
          uid,
          display_name: "Private Name",
          display_name_normalized: `private-${uid.slice(-12)}`,
          email: `${uid}@example.test`,
          role: "user",
          avatar_meta: avatarMeta,
        });
        expect(userError).toBeNull();

        const { data: post, error: postError } = await client
          .from("posts")
          .insert({ user_id: uid, text: "retained", image_meta: postMeta })
          .select("id")
          .single();
        expect(postError).toBeNull();
        postId = post!.id;

        const { data: comment, error: commentError } = await client
          .from("comments")
          .insert({
            user_id: uid,
            post_id: postId,
            text: "retained",
            image_meta: commentMeta,
          })
          .select("id")
          .single();
        expect(commentError).toBeNull();
        commentId = comment!.id;

        const { error: beginError } = await client.rpc(
          "begin_account_deletion",
          { p_uid: uid },
        );
        expect(beginError).toBeNull();

        const [{ data: user }, { data: retainedPost }, { data: retainedComment }] =
          await Promise.all([
            client.from("users").select("*").eq("uid", uid).single(),
            client.from("posts").select("image_meta").eq("id", postId).single(),
            client
              .from("comments")
              .select("image_meta")
              .eq("id", commentId)
              .single(),
          ]);

        expect(user).toMatchObject({
          uid,
          display_name: "",
          email: "",
          avatar_meta: null,
          is_active: false,
        });
        expect(user?.deleted_at).not.toBeNull();
        expect(user?.session_invalidated_at).not.toBeNull();
        expect(retainedPost?.image_meta).toEqual(postMeta);
        expect(retainedComment?.image_meta).toEqual(commentMeta);

        const { data: job } = await client
          .from("account_deletion_jobs")
          .select("avatar_meta")
          .eq("user_id", uid)
          .single();
        expect(job?.avatar_meta).toEqual(avatarMeta);

        const { error: latePostError } = await client.from("posts").insert({
          user_id: uid,
          text: "must be rejected",
        });
        expect(latePostError?.message).toContain("ACCOUNT_DELETED");
      } finally {
        await client.from("comments").delete().eq("user_id", uid);
        await client.from("posts").delete().eq("user_id", uid);
        await client.from("account_deletion_jobs").delete().eq("user_id", uid);
        await client.from("users").delete().eq("uid", uid);
      }
    });

    it("rejects the last active non-banned admin without changing the row", async () => {
      const client = createClient<Database>(supabaseUrl!, serviceRoleKey!, {
        auth: { persistSession: false },
      });
      const uid = `batch7-admin-${randomUUID()}`;
      const { data: existingAdmins } = await client
        .from("users")
        .select("uid, is_active")
        .eq("role", "admin")
        .is("deleted_at", null);
      const existingAdminIds = (existingAdmins ?? []).map(({ uid }) => uid);

      try {
        if (existingAdminIds.length > 0) {
          await client
            .from("users")
            .update({ is_active: false })
            .in("uid", existingAdminIds);
        }

        const { error: insertError } = await client.from("users").insert({
          uid,
          display_name: "Batch Admin",
          display_name_normalized: `admin-${uid.slice(-12)}`,
          email: `${uid}@example.test`,
          role: "admin",
          is_active: true,
          is_banned: false,
        });
        expect(insertError).toBeNull();

        const { error } = await client.rpc("begin_account_deletion", {
          p_uid: uid,
        });
        expect(error?.message).toContain("LAST_ACTIVE_ADMIN");

        const { data: unchanged } = await client
          .from("users")
          .select("deleted_at, session_invalidated_at")
          .eq("uid", uid)
          .single();
        expect(unchanged).toEqual({
          deleted_at: null,
          session_invalidated_at: null,
        });
      } finally {
        await client.from("account_deletion_jobs").delete().eq("user_id", uid);
        await client.from("users").delete().eq("uid", uid);
        await Promise.all(
          (existingAdmins ?? []).map(({ uid, is_active }) =>
            client.from("users").update({ is_active }).eq("uid", uid),
          ),
        );
      }
    });

    it("serializes concurrent admin deletions so exactly one admin remains", async () => {
      const client = createClient<Database>(supabaseUrl!, serviceRoleKey!, {
        auth: { persistSession: false },
      });
      const secondClient = createClient<Database>(
        supabaseUrl!,
        serviceRoleKey!,
        { auth: { persistSession: false } },
      );
      const firstUid = `batch7-admin-${randomUUID()}`;
      const secondUid = `batch7-admin-${randomUUID()}`;
      const { data: existingAdmins } = await client
        .from("users")
        .select("uid, is_active")
        .eq("role", "admin")
        .is("deleted_at", null);
      const existingAdminIds = (existingAdmins ?? []).map(({ uid }) => uid);

      try {
        if (existingAdminIds.length > 0) {
          await client
            .from("users")
            .update({ is_active: false })
            .in("uid", existingAdminIds);
        }

        const { error: insertError } = await client.from("users").insert([
          {
            uid: firstUid,
            display_name: "Concurrent Admin One",
            display_name_normalized: `admin-${firstUid.slice(-12)}`,
            email: `${firstUid}@example.test`,
            role: "admin",
            is_active: true,
            is_banned: false,
          },
          {
            uid: secondUid,
            display_name: "Concurrent Admin Two",
            display_name_normalized: `admin-${secondUid.slice(-12)}`,
            email: `${secondUid}@example.test`,
            role: "admin",
            is_active: true,
            is_banned: false,
          },
        ]);
        expect(insertError).toBeNull();

        const results = await Promise.all([
          client.rpc("begin_account_deletion", { p_uid: firstUid }),
          secondClient.rpc("begin_account_deletion", { p_uid: secondUid }),
        ]);
        expect(results.filter(({ error }) => error === null)).toHaveLength(1);
        expect(
          results.filter(({ error }) =>
            error?.message.includes("LAST_ACTIVE_ADMIN"),
          ),
        ).toHaveLength(1);

        const { data: adminsAfter } = await client
          .from("users")
          .select("uid, deleted_at")
          .in("uid", [firstUid, secondUid]);
        expect(
          adminsAfter?.filter(({ deleted_at }) => deleted_at === null),
        ).toHaveLength(1);
        expect(
          adminsAfter?.filter(({ deleted_at }) => deleted_at !== null),
        ).toHaveLength(1);
      } finally {
        await client
          .from("account_deletion_jobs")
          .delete()
          .in("user_id", [firstUid, secondUid]);
        await client
          .from("users")
          .delete()
          .in("uid", [firstUid, secondUid]);
        await Promise.all(
          (existingAdmins ?? []).map(({ uid, is_active }) =>
            client.from("users").update({ is_active }).eq("uid", uid),
          ),
        );
      }
    });
  },
);
