import "server-only";

import { createAppError } from "@/lib/AppError";
import { supabaseAdmin } from "@/lib/supabaseServer";
import type { TablesInsert } from "@/lib/supabase.database.types";
import { normalizeDisplayName } from "@/features/users/utils/displayName";
import { UserRole } from "@/features/users/types/user.type";

type DeleteSummary = {
  accountDeletionJobs: number;
  activityLogs: number;
  commentReports: number;
  comments: number;
  likes: number;
  moderationLogs: number;
  postReports: number;
  posts: number;
  users: number;
};

type DemoAuthUserSummary = {
  uid: string;
  email: string;
  created: boolean;
  updated: boolean;
};

export type DemoResetSummary = {
  deleted: DeleteSummary;
  auth: {
    deletedUsers: number;
    demoUser: DemoAuthUserSummary;
  };
  storage: {
    bucket: string | null;
    deletedObjects: number;
    skipped: boolean;
  };
  cleanState: {
    strategy: "empty";
    postsCreated: 0;
  };
};

type RequiredDemoEnv = {
  email: string;
  password: string;
  displayName: string;
};

type CountedDeleteResult = {
  count: number | null;
  error: { message?: string | null } | null;
};

function requireDemoEnv(): RequiredDemoEnv {
  const email = process.env.DEMO_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.DEMO_USER_PASSWORD;
  const displayName = process.env.DEMO_USER_DISPLAY_NAME?.trim();

  const missing: string[] = [];
  if (!email) missing.push("DEMO_USER_EMAIL");
  if (!password) missing.push("DEMO_USER_PASSWORD");
  if (!displayName) missing.push("DEMO_USER_DISPLAY_NAME");

  if (!email || !password || !displayName) {
    throw createAppError({
      code: "INTERNAL_ERROR",
      message: "Demo reset environment is not fully configured.",
      data: { missing },
    });
  }

  return { email, password, displayName };
}

function throwSupabaseError(
  operation: string,
  error: { message?: string | null } | null | undefined,
): void {
  if (!error) return;

  throw createAppError({
    code: "DB_ERROR",
    message: `[demoReset] ${operation} failed.`,
    details: { message: error.message },
  });
}

function countDeleted(result: CountedDeleteResult, operation: string): number {
  throwSupabaseError(operation, result.error);
  return result.count ?? 0;
}

async function deleteFromTable(
  table:
    | "account_deletion_jobs"
    | "activity_logs"
    | "comment_reports"
    | "comments"
    | "likes"
    | "moderation_logs"
    | "post_reports"
    | "posts",
  notNullColumn: string,
): Promise<number> {
  const result = await supabaseAdmin
    .from(table)
    .delete({ count: "exact" })
    .not(notNullColumn, "is", null);

  return countDeleted(result, `delete ${table}`);
}

async function findAuthUserByEmail(email: string) {
  let page = 1;
  const perPage = 500;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "[demoReset] Failed to list auth users.",
        details: { message: error.message },
      });
    }

    const users = data?.users ?? [];
    const found = users.find((user) => user.email?.toLowerCase() === email);
    if (found) return found;
    if (users.length < perPage) return null;

    page += 1;
  }
}

async function ensureDemoAuthUser(
  env: RequiredDemoEnv,
): Promise<DemoAuthUserSummary> {
  const existing = await findAuthUserByEmail(env.email);

  if (existing) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      existing.id,
      {
        password: env.password,
        email_confirm: true,
        user_metadata: { name: env.displayName },
      },
    );
    if (error) {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "[demoReset] Failed to update demo auth user.",
        details: { message: error.message },
      });
    }

    return {
      uid: existing.id,
      email: env.email,
      created: false,
      updated: true,
    };
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: env.email,
    password: env.password,
    email_confirm: true,
    user_metadata: { name: env.displayName },
  });
  if (error || !data?.user?.id) {
    throw createAppError({
      code: "INTERNAL_ERROR",
      message: "[demoReset] Failed to create demo auth user.",
      details: { message: error?.message },
    });
  }

  return {
    uid: data.user.id,
    email: env.email,
    created: true,
    updated: false,
  };
}

async function deleteNonDemoPublicUsers(demoUid: string): Promise<number> {
  const result = await supabaseAdmin
    .from("users")
    .delete({ count: "exact" })
    .neq("uid", demoUid);

  return countDeleted(result, "delete non-demo public users");
}

async function listAllAuthUsers() {
  const users = [];
  let page = 1;
  const perPage = 500;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "[demoReset] Failed to list auth users for cleanup.",
        details: { message: error.message },
      });
    }

    const batch = data?.users ?? [];
    users.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  return users;
}

async function deleteNonDemoAuthUsers(
  demoUid: string,
  demoEmail: string,
): Promise<number> {
  const users = await listAllAuthUsers();
  let deleted = 0;

  for (const user of users) {
    if (user.id === demoUid || user.email?.toLowerCase() === demoEmail) {
      continue;
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (error) {
      const status = "status" in error ? error.status : undefined;
      if (
        status === 404 ||
        error.message.toLowerCase().includes("user not found")
      ) {
        continue;
      }

      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "[demoReset] Failed to delete non-demo auth user.",
        details: { message: error.message, uid: user.id },
      });
    }

    deleted += 1;
  }

  return deleted;
}

async function ensureDemoProfile(
  demoUser: DemoAuthUserSummary,
  env: RequiredDemoEnv,
): Promise<void> {
  const now = new Date().toISOString();
  const row: TablesInsert<"users"> = {
    uid: demoUser.uid,
    email: env.email,
    display_name: env.displayName,
    display_name_normalized: normalizeDisplayName(env.displayName),
    role: UserRole.User,
    avatar_url: null,
    avatar_meta: null,
    updated_at: now,
    last_online: now,
    is_active: true,
    is_banned: false,
    banned_at: null,
    banned_by: null,
    banned_reason: null,
    is_restricted: false,
    restricted_at: null,
    restricted_by: null,
    restriction_reason: null,
    last_known_ip: null,
    session_invalidated_at: null,
    deleted_at: null,
  };

  const { error } = await supabaseAdmin.from("users").upsert(row, {
    onConflict: "uid",
  });
  throwSupabaseError("upsert demo public user", error);
}

function isStorageFolder(item: { id?: string | null; metadata?: unknown }) {
  return !item.id && !item.metadata;
}

async function listStorageFiles(
  bucket: string,
  prefix = "",
): Promise<string[]> {
  const limit = 100;
  let offset = 0;
  const paths: string[] = [];

  while (true) {
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(
      prefix,
      {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      },
    );
    if (error) {
      throw createAppError({
        code: "EXTERNAL_SERVICE",
        message: "[demoReset] Failed to list demo storage.",
        details: { message: error.message, bucket, prefix },
      });
    }

    const items = data ?? [];
    for (const item of items) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (isStorageFolder(item)) {
        paths.push(...(await listStorageFiles(bucket, path)));
      } else {
        paths.push(path);
      }
    }

    if (items.length < limit) break;
    offset += limit;
  }

  return paths;
}

async function cleanDemoStorage(): Promise<DemoResetSummary["storage"]> {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || null;
  if (!bucket) {
    return { bucket: null, deletedObjects: 0, skipped: true };
  }

  const paths = await listStorageFiles(bucket);
  let deletedObjects = 0;

  for (let i = 0; i < paths.length; i += 100) {
    const chunk = paths.slice(i, i + 100);
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .remove(chunk);
    if (error) {
      throw createAppError({
        code: "EXTERNAL_SERVICE",
        message: "[demoReset] Failed to remove demo storage objects.",
        details: { message: error.message, bucket, requested: chunk.length },
      });
    }
    deletedObjects += data?.length ?? chunk.length;
  }

  return { bucket, deletedObjects, skipped: false };
}

async function deleteApplicationData(): Promise<DeleteSummary> {
  const deleted: DeleteSummary = {
    accountDeletionJobs: 0,
    activityLogs: 0,
    commentReports: 0,
    comments: 0,
    likes: 0,
    moderationLogs: 0,
    postReports: 0,
    posts: 0,
    users: 0,
  };

  deleted.postReports = await deleteFromTable("post_reports", "id");
  deleted.commentReports = await deleteFromTable("comment_reports", "id");
  deleted.moderationLogs = await deleteFromTable("moderation_logs", "id");
  deleted.activityLogs = await deleteFromTable("activity_logs", "id");
  deleted.likes = await deleteFromTable("likes", "id");
  deleted.comments = await deleteFromTable("comments", "id");
  deleted.posts = await deleteFromTable("posts", "id");
  deleted.accountDeletionJobs = await deleteFromTable(
    "account_deletion_jobs",
    "user_id",
  );

  return deleted;
}

export async function resetDemoData(): Promise<DemoResetSummary> {
  if (process.env.IS_DEMO !== "true") {
    throw createAppError({
      code: "FORBIDDEN",
      message: "Demo reset is disabled outside demo mode.",
    });
  }

  const env = requireDemoEnv();
  console.info("[demoReset] Starting demo reset.");

  const demoUser = await ensureDemoAuthUser(env);
  const deleted = await deleteApplicationData();
  deleted.users = await deleteNonDemoPublicUsers(demoUser.uid);
  const deletedAuthUsers = await deleteNonDemoAuthUsers(demoUser.uid, env.email);
  await ensureDemoAuthUser(env);
  await ensureDemoProfile(demoUser, env);
  const storage = await cleanDemoStorage();

  const summary: DemoResetSummary = {
    deleted,
    auth: {
      deletedUsers: deletedAuthUsers,
      demoUser,
    },
    storage,
    cleanState: {
      strategy: "empty",
      postsCreated: 0,
    },
  };

  console.info("[demoReset] Demo reset completed.", summary);
  return summary;
}
