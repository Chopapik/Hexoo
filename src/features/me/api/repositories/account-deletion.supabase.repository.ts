import { createAppError } from "@/lib/AppError";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { parseImageMeta } from "@/features/images/utils/imageMeta";
import type {
  AccountDeletionJob,
  AccountDeletionRepository,
  AccountDeletionStep,
} from "./account-deletion.repository.interface";

type JobRow = {
  user_id: string;
  avatar_meta: unknown;
  avatar_deleted_at: string | null;
  auth_deleted_at: string | null;
  completed_at: string | null;
  attempt_count: number;
  last_failed_step: string | null;
};

function parseDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

function mapJob(raw: unknown): AccountDeletionJob {
  const row = raw as JobRow;
  return {
    userId: row.user_id,
    avatarMeta: parseImageMeta(row.avatar_meta),
    avatarDeletedAt: parseDate(row.avatar_deleted_at),
    authDeletedAt: parseDate(row.auth_deleted_at),
    completedAt: parseDate(row.completed_at),
    attemptCount: row.attempt_count,
    lastFailedStep:
      row.last_failed_step === "avatar" ||
      row.last_failed_step === "auth" ||
      row.last_failed_step === "progress"
        ? row.last_failed_step
        : null,
  };
}

function mapRpcError(error: { message?: string } | null): never {
  if (error?.message?.includes("LAST_ACTIVE_ADMIN")) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "Cannot delete the last active admin",
    });
  }
  if (error?.message?.includes("USER_NOT_FOUND")) {
    throw createAppError({ code: "USER_NOT_FOUND", message: "User not found" });
  }
  throw createAppError({
    code: "DB_ERROR",
    message: "Account deletion database operation failed",
    details: error,
  });
}

function safeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Account deletion step failed";
}

export class AccountDeletionSupabaseRepository
  implements AccountDeletionRepository
{
  async begin(userId: string): Promise<AccountDeletionJob> {
    const { data, error } = await supabaseAdmin.rpc("begin_account_deletion", {
      p_uid: userId,
    });
    if (error) mapRpcError(error);
    return mapJob(data);
  }

  async completeStep(
    userId: string,
    step: AccountDeletionStep,
  ): Promise<AccountDeletionJob> {
    const { data, error } = await supabaseAdmin.rpc(
      "complete_account_deletion_step",
      { p_uid: userId, p_step: step },
    );
    if (error) mapRpcError(error);
    return mapJob(data);
  }

  async recordFailure(
    userId: string,
    step: AccountDeletionStep | "progress",
    errorToRecord: unknown,
  ): Promise<void> {
    const { error } = await supabaseAdmin.rpc("record_account_deletion_failure", {
      p_uid: userId,
      p_step: step,
      p_error: safeErrorMessage(errorToRecord),
    });
    if (error) mapRpcError(error);
  }
}
