import { createAppError } from "@/lib/AppError";
import { logActivity } from "@/features/activity/api/services";
import type { UserRepository } from "../repositories/user.repository.interface";

export type RestrictionSource = "ADMIN" | "AI_SYSTEM";

export class UserRestrictionApplier {
  constructor(private readonly repository: UserRepository) {}

  async apply(
    uid: string,
    reason: string,
    source: RestrictionSource,
  ): Promise<void> {
    if (!uid) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "UID is required for restriction",
      });
    }

    await this.repository.updateUserRestriction({
      uid,
      isRestricted: true,
      restrictedBy: source,
      restrictedReason: reason,
    });

    await logActivity(
      uid,
      "USER_RESTRICTED",
      `Restricted by ${source}. Reason: ${reason}`,
    );
  }
}
