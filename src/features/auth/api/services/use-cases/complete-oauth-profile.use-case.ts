import { createAppError } from "@/lib/AppError";
import { isUsernameTaken } from "../../utils/checkUsernameUnique";

import type { AuthRepository } from "../../repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import type { CompleteOAuthProfileResult } from "../auth.service.interface";

import { AuthSessionIssuer } from "../auth.session.issuer";

export class CompleteOAuthProfileUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly sessionIssuer: AuthSessionIssuer,
  ) {}

  async execute(data: {
    idToken: string;
    refreshToken?: string;
    name: string;
  }): Promise<CompleteOAuthProfileResult> {
    const { idToken, refreshToken, name } = data;

    const decoded = await this.authRepository.verifyIdToken(idToken);
    const { uid, email } = decoded;

    const trimmed = (name ?? "").trim();
    if (!trimmed) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[authService.completeOAuthProfile] Username is required.",
        details: { field: "name" },
      });
    }

    const existing = await this.userRepository.getUserByUid(uid);
    if (!existing) {
      throw createAppError({
        code: "USER_NOT_FOUND",
        message:
          "[authService.completeOAuthProfile] No pending OAuth user record found. Retry OAuth login first.",
      });
    }

    if (existing.hasUsername) {
      const user = await this.sessionIssuer.issueAppSession({
        userData: existing,
        idToken,
        refreshToken,
        email,
        activityDetails: "User logged in via OAuth (already onboarded)",
      });
      return { user };
    }

    if (await isUsernameTaken(trimmed, uid)) {
      throw createAppError({
        code: "CONFLICT",
        message: `[authService.completeOAuthProfile] Display name '${trimmed}' is already taken.`,
        details: { field: "name" },
      });
    }

    try {
      await this.userRepository.updateUser(uid, { name: trimmed });
    } catch (error) {
      throw createAppError({
        code: "DB_ERROR",
        message:
          "[authService.completeOAuthProfile] Failed to persist username.",
        details: error,
      });
    }

    try {
      await this.authRepository.updateUser(uid, { displayName: trimmed });
    } catch (error) {
      console.warn(
        "[authService.completeOAuthProfile] Failed to update Supabase auth metadata.",
        error,
      );
    }

    const refreshed = await this.userRepository.getUserByUid(uid);
    if (!refreshed) {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message:
          "[authService.completeOAuthProfile] User disappeared after username update.",
      });
    }

    const user = await this.sessionIssuer.issueAppSession({
      userData: refreshed,
      idToken,
      refreshToken,
      email,
      activityDetails: "User completed OAuth onboarding",
    });

    return { user };
  }
}
