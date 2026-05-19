import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { logActivity } from "@/features/activity/api/services";
import type { SessionData, UpdatePasswordData } from "../../../me.type";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";

export class UpdatePasswordUseCase {
  constructor(
    private readonly session: SessionData,
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(passwordData: UpdatePasswordData): Promise<void> {
    const { uid } = this.session;
    const { UpdatePasswordSchema } = await import("../../../me.type");
    const parsed = UpdatePasswordSchema.safeParse(passwordData);

    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[UpdatePasswordUseCase] Password validation failed.",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const { newPassword } = parsed.data;

    await this.authRepository.updateUser(uid, {
      password: newPassword,
    });

    await this.userRepository.updateUser(uid, {
      updatedAt: new Date(),
    });

    await logActivity(uid, "PASSWORD_CHANGED", "User changed password");
  }
}
