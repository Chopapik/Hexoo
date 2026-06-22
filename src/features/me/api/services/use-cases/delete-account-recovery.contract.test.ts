import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";
import type {
  AccountDeletionJob,
  AccountDeletionRepository,
  AccountDeletionStep,
} from "../../repositories";
import { ProcessAccountDeletionUseCase } from "./process-account-deletion.use-case";

const avatar = {
  storageBucket: "media",
  storageLocation: "avatars",
  fileName: "user.webp",
  downloadToken: "token",
  contentType: "image/webp",
  sizeBytes: 100,
};

function job(overrides: Partial<AccountDeletionJob> = {}): AccountDeletionJob {
  return {
    userId: "user-1",
    avatarMeta: avatar,
    avatarDeletedAt: null,
    authDeletedAt: null,
    completedAt: null,
    attemptCount: 1,
    lastFailedStep: null,
    ...overrides,
  };
}

describe("Batch 7 account deletion recovery", () => {
  let current: AccountDeletionJob;
  let repository: AccountDeletionRepository;
  let authDelete: ReturnType<typeof vi.fn>;
  let imageDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    current = job();
    repository = {
      begin: vi.fn(async () => ({ ...current })),
      completeStep: vi.fn(async (_uid: string, step: AccountDeletionStep) => {
        const now = new Date();
        current = {
          ...current,
          avatarMeta: step === "avatar" ? null : current.avatarMeta,
          avatarDeletedAt:
            step === "avatar" ? now : current.avatarDeletedAt,
          authDeletedAt: step === "auth" ? now : current.authDeletedAt,
        };
        if (current.avatarDeletedAt && current.authDeletedAt) {
          current.completedAt = now;
        }
        return { ...current };
      }),
      recordFailure: vi.fn(async () => undefined),
    };
    authDelete = vi.fn(async () => undefined);
    imageDelete = vi.fn(async () => undefined);
  });

  function useCase() {
    return new ProcessAccountDeletionUseCase(
      repository,
      { deleteUser: authDelete } as unknown as AuthRepository,
      imageDelete,
    );
  }

  it("completes avatar before Auth and records both durable steps", async () => {
    await expect(useCase().execute("user-1")).resolves.toEqual({
      state: "completed",
    });

    expect(imageDelete).toHaveBeenCalledWith(avatar);
    expect(authDelete).toHaveBeenCalledWith("user-1");
    expect(repository.completeStep).toHaveBeenNthCalledWith(
      1,
      "user-1",
      "avatar",
    );
    expect(repository.completeStep).toHaveBeenNthCalledWith(
      2,
      "user-1",
      "auth",
    );
  });

  it("leaves avatar failure pending and retries safely", async () => {
    imageDelete.mockRejectedValue(new Error("storage unavailable"));

    await expect(useCase().execute("user-1")).resolves.toEqual({
      state: "recovery_pending",
    });
    expect(authDelete).not.toHaveBeenCalled();
    expect(repository.recordFailure).toHaveBeenCalledWith(
      "user-1",
      "avatar",
      expect.any(Error),
    );

    imageDelete.mockResolvedValue(undefined);
    await expect(useCase().execute("user-1")).resolves.toEqual({
      state: "completed",
    });
  });

  it("does not repeat completed avatar cleanup when Auth fails", async () => {
    authDelete.mockRejectedValueOnce(new Error("auth unavailable"));

    await expect(useCase().execute("user-1")).resolves.toEqual({
      state: "recovery_pending",
    });
    expect(current.avatarDeletedAt).not.toBeNull();

    await expect(useCase().execute("user-1")).resolves.toEqual({
      state: "completed",
    });
    expect(imageDelete).toHaveBeenCalledTimes(1);
    expect(authDelete).toHaveBeenCalledTimes(2);
  });

  it("keeps a durable pending state if progress recording fails", async () => {
    vi.mocked(repository.completeStep).mockRejectedValueOnce(
      new Error("progress write failed"),
    );

    await expect(useCase().execute("user-1")).resolves.toEqual({
      state: "recovery_pending",
    });
    expect(repository.recordFailure).toHaveBeenCalledWith(
      "user-1",
      "progress",
      expect.any(Error),
    );
  });

  it("treats an already-cleaned avatar step as idempotent success", async () => {
    current = job({
      avatarMeta: null,
      avatarDeletedAt: new Date(),
    });

    await expect(useCase().execute("user-1")).resolves.toEqual({
      state: "completed",
    });
    expect(imageDelete).not.toHaveBeenCalled();
    expect(authDelete).toHaveBeenCalledWith("user-1");
  });
});
