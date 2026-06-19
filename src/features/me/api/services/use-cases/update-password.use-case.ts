import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { logActivity } from "@/features/activity/api/services";
import type { SessionData, UpdatePasswordData } from "../../../me.type";
import type {
  AuthRepository,
  RefreshTokens,
} from "@/features/auth/api/repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import {
  clearAllAuthCookies,
  setRefreshCookie,
  setSessionCookie,
} from "@/features/auth/api/utils/session.cookies";
import { getJwtIssuedAt } from "@/features/auth/api/utils/session-cutoff";

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

    const { oldPassword, newPassword } = parsed.data;
    const email = this.session.email?.trim();

    if (!email) {
      throw createAppError({
        code: "INVALID_CREDENTIALS",
        message:
          "[UpdatePasswordUseCase] Cannot verify current password without email.",
        data: { field: "oldPassword" },
      });
    }

    const verifiedUser = await this.authRepository.verifyPassword(
      email,
      oldPassword,
    );

    if (verifiedUser.uid !== uid) {
      throw createAppError({
        code: "INVALID_CREDENTIALS",
        message:
          "[UpdatePasswordUseCase] Current password verified for a different user.",
        data: { field: "oldPassword" },
      });
    }

    await this.authRepository.updateUser(uid, {
      password: newPassword,
    });

    let freshTokens: RefreshTokens;
    let freshIssuedAt: Date;

    try {
      freshTokens = await this.authRepository.signInWithPassword(
        email,
        newPassword,
      );
      const freshUser = await this.authRepository.verifyIdToken(
        freshTokens.access_token,
      );
      const issuedAt = getJwtIssuedAt(freshTokens.access_token);

      if (freshUser.uid !== uid || !issuedAt) {
        throw createAppError({
          code: "INVALID_SESSION",
          message: "[UpdatePasswordUseCase] Fresh session is invalid.",
        });
      }

      freshIssuedAt = issuedAt;
    } catch (error) {
      await clearAllAuthCookies();
      throw createAppError({
        code: "INVALID_SESSION",
        message:
          "[UpdatePasswordUseCase] Password changed; fresh sign-in failed. Please log in again.",
        details: error,
        data: { passwordChanged: true, reloginRequired: true },
      });
    }

    const sessionCutoff = new Date(freshIssuedAt.getTime() - 1);

    await this.userRepository.updateUser(uid, {
      sessionInvalidatedAt: sessionCutoff,
    });

    await setSessionCookie(freshTokens.access_token);
    await setRefreshCookie(freshTokens.refresh_token);

    await logActivity(uid, "PASSWORD_CHANGED", "User changed password");
  }
}
