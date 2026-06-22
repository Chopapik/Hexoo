import { createAppError } from "@/lib/AppError";
import {
  setSessionCookie,
  setRefreshCookie,
} from "@/features/auth/api/utils/session.cookies";
import type { ActivityType } from "@/features/activity/api/services";

import type { AuthRepository } from "../repositories/authRepository.interface";
import type { OAuthSessionUser } from "./auth.service.interface";
import type { UserEntity } from "@/features/users/types/user.entity";

import { AuthSessionMapper } from "./auth.session.mapper";

export const SESSION_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

type ActivityLogger = (
  userId: string,
  action: ActivityType,
  details: string,
) => Promise<void>;

export class AuthSessionIssuer {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logActivity: ActivityLogger,
    private readonly mapper: AuthSessionMapper,
  ) {}

  async issueAppSession(params: {
    userData: UserEntity;
    idToken: string;
    refreshToken?: string;
    email?: string | null;
    activityDetails: string;
  }): Promise<OAuthSessionUser> {
    const { userData, idToken, refreshToken, email, activityDetails } = params;

    if (userData.deletedAt) {
      throw createAppError({
        code: "ACCOUNT_DELETED",
        message: "[authService.issueAppSession] User account was deleted",
      });
    }

    if (userData.isBanned) {
      await this.logActivity(
        userData.uid,
        "LOGIN_FAILED",
        "Login attempt on banned account",
      );
      throw createAppError({
        code: "ACCOUNT_BANNED",
        message: "[authService.issueAppSession] User is banned",
      });
    }

    const sessionCookie = await this.authRepository.createSessionCookie(
      idToken,
      SESSION_EXPIRES_MS,
    );

    try {
      await this.logActivity(userData.uid, "LOGIN_SUCCESS", activityDetails);
    } catch (error) {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "Failed to update user stats or log activity",
        details: error,
      });
    }

    await setSessionCookie(sessionCookie);
    if (refreshToken) await setRefreshCookie(refreshToken);

    return this.mapper.toOAuthSessionUser(userData, email);
  }
}
