import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";
import type { ImageDeleter } from "@/features/images/api/image-cleanup";
import { deleteImageWithRetry } from "@/features/images/api/image-cleanup";
import type { AccountDeletionRepository } from "../../repositories";

export type AccountDeletionResult = {
  state: "completed" | "recovery_pending";
};

export class ProcessAccountDeletionUseCase {
  constructor(
    private readonly repository: AccountDeletionRepository,
    private readonly authRepository: AuthRepository,
    private readonly deleteImage: ImageDeleter,
  ) {}

  private async recordFailure(
    userId: string,
    step: "avatar" | "auth" | "progress",
    error: unknown,
  ): Promise<void> {
    try {
      await this.repository.recordFailure(userId, step, error);
    } catch {
      // The job was durably created before external work. A progress-write
      // failure leaves the unfinished step retryable from that durable state.
    }
  }

  async execute(userId: string): Promise<AccountDeletionResult> {
    let job = await this.repository.begin(userId);

    if (!job.avatarDeletedAt) {
      try {
        await deleteImageWithRetry(job.avatarMeta, this.deleteImage);
      } catch (error) {
        await this.recordFailure(userId, "avatar", error);
        return { state: "recovery_pending" };
      }

      try {
        job = await this.repository.completeStep(userId, "avatar");
      } catch (error) {
        await this.recordFailure(userId, "progress", error);
        return { state: "recovery_pending" };
      }
    }

    if (!job.authDeletedAt) {
      try {
        await this.authRepository.deleteUser(userId);
      } catch (error) {
        await this.recordFailure(userId, "auth", error);
        return { state: "recovery_pending" };
      }

      try {
        job = await this.repository.completeStep(userId, "auth");
      } catch (error) {
        await this.recordFailure(userId, "progress", error);
        return { state: "recovery_pending" };
      }
    }

    return {
      state: job.avatarDeletedAt && job.authDeletedAt
        ? "completed"
        : "recovery_pending",
    };
  }
}
