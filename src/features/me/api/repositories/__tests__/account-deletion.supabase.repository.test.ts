import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountDeletionSupabaseRepository } from "../account-deletion.supabase.repository";

const supabaseMock = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: {
    rpc: supabaseMock.rpc,
  },
}));

type AccountDeletionJobRow = {
  user_id: string;
  avatar_meta: unknown;
  avatar_deleted_at: string | null;
  auth_deleted_at: string | null;
  completed_at: string | null;
  attempt_count: number;
  last_failed_step: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

const avatarMeta = {
  storageBucket: "avatars-bucket",
  storageLocation: "/avatars/account-deletion",
  fileName: "user-avatar.webp",
  downloadToken: "download-token-1",
  contentType: "image/webp",
  sizeBytes: 42_001,
  isAnimated: false,
};

function jobRow(
  overrides: Partial<AccountDeletionJobRow> = {},
): AccountDeletionJobRow {
  return {
    user_id: "account-delete-user-1",
    avatar_meta: avatarMeta,
    avatar_deleted_at: "2026-07-01T01:02:03.000Z",
    auth_deleted_at: "2026-07-02T02:03:04.000Z",
    completed_at: "2026-07-03T03:04:05.000Z",
    attempt_count: 7,
    last_failed_step: "auth",
    last_error: "auth provider rejected delete",
    created_at: "2026-06-30T00:00:01.000Z",
    updated_at: "2026-07-03T04:05:06.000Z",
    ...overrides,
  };
}

describe("AccountDeletionSupabaseRepository", () => {
  let repository: AccountDeletionSupabaseRepository;

  beforeEach(() => {
    repository = new AccountDeletionSupabaseRepository();
    supabaseMock.rpc.mockReset();
  });

  it("starts account deletion with the expected RPC payload and maps the returned job row", async () => {
    const row = jobRow({
      user_id: "begin-delete-user-101",
      last_failed_step: "auth",
    });
    supabaseMock.rpc.mockResolvedValueOnce({ data: row, error: null });

    const result = await repository.begin("begin-delete-user-101");

    expect(supabaseMock.rpc).toHaveBeenCalledOnce();
    expect(supabaseMock.rpc).toHaveBeenCalledWith("begin_account_deletion", {
      p_uid: "begin-delete-user-101",
    });
    expect(result).toEqual({
      userId: "begin-delete-user-101",
      avatarMeta: {
        storageBucket: "avatars-bucket",
        storageLocation: "avatars/account-deletion",
        fileName: "user-avatar.webp",
        downloadToken: "download-token-1",
        contentType: "image/webp",
        sizeBytes: 42_001,
        isAnimated: false,
      },
      avatarDeletedAt: new Date("2026-07-01T01:02:03.000Z"),
      authDeletedAt: new Date("2026-07-02T02:03:04.000Z"),
      completedAt: new Date("2026-07-03T03:04:05.000Z"),
      attemptCount: 7,
      lastFailedStep: "auth",
    });
  });

  it("marks a deletion step complete with the expected RPC payload and maps the returned row", async () => {
    const row = jobRow({
      user_id: "complete-delete-user-202",
      avatar_deleted_at: "2026-08-04T05:06:07.000Z",
      auth_deleted_at: null,
      completed_at: null,
      attempt_count: 3,
      last_failed_step: "progress",
    });
    supabaseMock.rpc.mockResolvedValueOnce({ data: row, error: null });

    const result = await repository.completeStep(
      "complete-delete-user-202",
      "avatar",
    );

    expect(supabaseMock.rpc).toHaveBeenCalledOnce();
    expect(supabaseMock.rpc).toHaveBeenCalledWith(
      "complete_account_deletion_step",
      {
        p_uid: "complete-delete-user-202",
        p_step: "avatar",
      },
    );
    expect(result).toMatchObject({
      userId: "complete-delete-user-202",
      avatarDeletedAt: new Date("2026-08-04T05:06:07.000Z"),
      authDeletedAt: null,
      completedAt: null,
      attemptCount: 3,
      lastFailedStep: "progress",
    });
  });

  it("maps a pending job row with nullable fields", async () => {
    const row = jobRow({
      user_id: "pending-delete-user-303",
      avatar_meta: null,
      avatar_deleted_at: null,
      auth_deleted_at: null,
      completed_at: null,
      attempt_count: 1,
      last_failed_step: null,
      last_error: null,
    });
    supabaseMock.rpc.mockResolvedValueOnce({ data: row, error: null });

    const result = await repository.begin("pending-delete-user-303");

    expect(result).toEqual({
      userId: "pending-delete-user-303",
      avatarMeta: null,
      avatarDeletedAt: null,
      authDeletedAt: null,
      completedAt: null,
      attemptCount: 1,
      lastFailedStep: null,
    });
  });

  it("normalizes unsupported failed-step values to null", async () => {
    const row = jobRow({
      user_id: "invalid-step-delete-user-404",
      last_failed_step: "storage",
    });
    supabaseMock.rpc.mockResolvedValueOnce({ data: row, error: null });

    const result = await repository.begin("invalid-step-delete-user-404");

    expect(result.lastFailedStep).toBeNull();
  });

  it("records Error failures with the expected RPC payload", async () => {
    supabaseMock.rpc.mockResolvedValueOnce({ data: undefined, error: null });

    await expect(
      repository.recordFailure(
        "failure-delete-user-505",
        "avatar",
        new Error("storage delete failed"),
      ),
    ).resolves.toBeUndefined();

    expect(supabaseMock.rpc).toHaveBeenCalledOnce();
    expect(supabaseMock.rpc).toHaveBeenCalledWith(
      "record_account_deletion_failure",
      {
        p_uid: "failure-delete-user-505",
        p_step: "avatar",
        p_error: "storage delete failed",
      },
    );
  });

  it("records non-Error failures with the repository fallback message", async () => {
    supabaseMock.rpc.mockResolvedValueOnce({ data: undefined, error: null });

    await expect(
      repository.recordFailure("failure-delete-user-606", "progress", {
        message: "raw object should not be recorded",
      }),
    ).resolves.toBeUndefined();

    expect(supabaseMock.rpc).toHaveBeenCalledWith(
      "record_account_deletion_failure",
      {
        p_uid: "failure-delete-user-606",
        p_step: "progress",
        p_error: "Account deletion step failed",
      },
    );
  });

  it("maps RPC errors to app error codes", async () => {
    const cases = [
      [
        { message: "LAST_ACTIVE_ADMIN: refusing to delete final admin" },
        "FORBIDDEN",
        "Cannot delete the last active admin",
      ],
      [
        { message: "USER_NOT_FOUND: missing account deletion target" },
        "USER_NOT_FOUND",
        "User not found",
      ],
      [
        { message: "database connection unavailable" },
        "DB_ERROR",
        "Account deletion database operation failed",
      ],
    ] as const;

    for (const [rpcError, code, message] of cases) {
      supabaseMock.rpc.mockResolvedValueOnce({ data: null, error: rpcError });

      await expect(
        repository.begin("error-delete-user-707"),
      ).rejects.toMatchObject({
        code,
        message,
      });
    }
  });
});
