import type { ImageMeta } from "@/features/images/types/image.type";

export type AccountDeletionStep = "avatar" | "auth";

export type AccountDeletionJob = {
  userId: string;
  avatarMeta: ImageMeta | null;
  avatarDeletedAt: Date | null;
  authDeletedAt: Date | null;
  completedAt: Date | null;
  attemptCount: number;
  lastFailedStep: AccountDeletionStep | "progress" | null;
};

export interface AccountDeletionRepository {
  begin(userId: string): Promise<AccountDeletionJob>;
  completeStep(
    userId: string,
    step: AccountDeletionStep,
  ): Promise<AccountDeletionJob>;
  recordFailure(
    userId: string,
    step: AccountDeletionStep | "progress",
    error: unknown,
  ): Promise<void>;
}
