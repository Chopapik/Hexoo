import { createAppError } from "@/lib/AppError";
import {
  setSessionCookie,
  setRefreshCookie,
} from "@/features/auth/api/utils/session.cookies";
import type { ActivityType } from "@/features/activity/api/services";

import type { AuthRepository } from "../../repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";

import { AuthSessionMapper } from "../auth.session.mapper";
import { SESSION_EXPIRES_MS } from "../auth.session.issuer";

type ActivityLogger = (
  userId: string,
  action: ActivityType,
  details: string,
) => Promise<void>;

export class CreateSessionUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly logActivity: ActivityLogger,
    private readonly mapper: AuthSessionMapper,
  ) {}

  async execute(idToken: string, refreshToken?: string) {
    const decodedToken = await this.authRepository.verifyIdToken(idToken);

    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const userData = await this.userRepository.getUserByUid(uid);

    if (!userData) {
      await this.logActivity(
        uid,
        "LOGIN_FAILED",
        "Login attempt for non-existent user record",
      );
      throw createAppError({
        code: "USER_NOT_FOUND",
        message: `[authService.createSession] User document for UID ${uid} does not exist in database.`,
      });
    }

    if (userData.isBanned) {
      await this.logActivity(
        uid,
        "LOGIN_FAILED",
        "Login attempt on banned account",
      );
      throw createAppError({
        code: "ACCOUNT_BANNED",
        message: "[authService.createSession] User is banned",
      });
    }

    const sessionCookie = await this.authRepository.createSessionCookie(
      idToken,
      SESSION_EXPIRES_MS,
    );

    try {
      await this.logActivity(uid, "LOGIN_SUCCESS", "User logged in");
    } catch (error) {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "Failed to update user stats or log activity",
        details: error,
      });
    }

    await setSessionCookie(sessionCookie);
    if (refreshToken) await setRefreshCookie(refreshToken);

    return {
      user: this.mapper.toOAuthSessionUser(userData, email),
    };
  }
}
