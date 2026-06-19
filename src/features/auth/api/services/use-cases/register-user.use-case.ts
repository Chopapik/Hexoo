import { createAppError } from "@/lib/AppError";
import {
  setSessionCookie,
  setRefreshCookie,
} from "@/features/auth/api/utils/session.cookies";
import { isUsernameTaken } from "../../utils/checkUsernameUnique";
import type { ActivityType } from "@/features/activity/api/services";
import { UserRole } from "@/features/users/types/user.type";
import type { ErrorCode } from "@/lib/AppError";

import type { AuthRepository } from "../../repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";

import { AuthSessionMapper } from "../auth.session.mapper";
import { SESSION_EXPIRES_MS } from "../auth.session.issuer";

type ActivityLogger = (
  userId: string,
  action: ActivityType,
  details: string,
) => Promise<void>;

export class RegisterUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly logActivity: ActivityLogger,
    private readonly mapper: AuthSessionMapper,
  ) {}

  async execute(data: {
    idToken: string;
    name: string;
    email: string;
    refreshToken?: string;
  }) {
    const { idToken, name } = data;

    const decodedToken = await this.authRepository.verifyIdToken(idToken);

    const { uid, email } = decodedToken;
    let existingProfile;
    try {
      existingProfile = await this.userRepository.getUserByUid(uid);
    } catch (error) {
      throw createAppError({
        code: "DB_ERROR",
        message: "[authService.registerUser] Failed to load user profile.",
        details: error,
      });
    }

    if (existingProfile) {
      await this.issueSession(idToken, data.refreshToken);

      return {
        user: {
          ...this.mapper.mapUserToSessionData(existingProfile, email),
          email: (email ?? existingProfile.email) || undefined,
          role: "user" as const,
        },
      };
    }

    const displayName = (name ?? "").trim();

    if (!displayName) {
      return this.cleanupFreshRegistrationAndThrow(uid, {
        code: "VALIDATION_ERROR",
        message: "[authService.registerUser] Display name is required.",
        details: { field: "name" },
      });
    }

    let usernameTaken;
    try {
      usernameTaken = await isUsernameTaken(displayName);
    } catch (error) {
      return this.cleanupFreshRegistrationAndThrow(uid, {
        code: "DB_ERROR",
        message:
          "[authService.registerUser] Failed to validate display name uniqueness.",
        details: error,
      });
    }

    if (usernameTaken) {
      return this.cleanupFreshRegistrationAndThrow(uid, {
        code: "CONFLICT",
        message: `[authService.registerUser] Display name '${displayName}' is already taken.`,
        details: { field: "name" },
      });
    }

    try {
      await this.userRepository.createUser({
        uid,
        name: displayName,
        email: email ?? "",
        role: UserRole.User,
      });
      await this.logActivity(uid, "USER_CREATED", "Account created");
      await this.issueSession(idToken, data.refreshToken);

      const createdUser = await this.userRepository.getUserByUid(uid);

      if (!createdUser) {
        throw createAppError({
          code: "DB_ERROR",
          message:
            "[authService.registerUser] Created user profile could not be loaded.",
          details: { uid },
        });
      }

      return {
        user: {
          ...this.mapper.mapUserToSessionData(createdUser, email),
          email: (email ?? createdUser.email) || undefined,
          role: "user" as const,
        },
      };
    } catch (error) {
      return this.cleanupFreshRegistrationAndThrow(uid, {
        code: "DB_ERROR",
        message: "[authService.registerUser] Registration failed.",
        details: error,
      });
    }
  }

  private async issueSession(idToken: string, refreshToken?: string) {
    const sessionCookie = await this.authRepository.createSessionCookie(
      idToken,
      SESSION_EXPIRES_MS,
    );

    await setSessionCookie(sessionCookie);
    if (refreshToken) await setRefreshCookie(refreshToken);
  }

  private async cleanupFreshRegistrationAndThrow(
    uid: string,
    error: {
      code: ErrorCode;
      message: string;
      details?: unknown;
    },
  ): Promise<never> {
    const compensationErrors: unknown[] = [];

    try {
      await this.userRepository.deleteUser(uid);
    } catch (compensationError) {
      compensationErrors.push({
        stage: "dbProfile",
        error: compensationError,
      });
    }

    try {
      await this.authRepository.deleteUser(uid);
    } catch (compensationError) {
      compensationErrors.push({
        stage: "authUser",
        error: compensationError,
      });
    }

    if (compensationErrors.length > 0) {
      throw createAppError({
        code: "DB_ERROR",
        message:
          "[authService.registerUser] Registration failed and cleanup failed.",
        details: {
          error: error.details,
          compensationErrors,
          originalCode: error.code,
        },
        data: { compensation: "FAILED", uid },
      });
    }

    throw createAppError({
      code: error.code,
      message: error.message,
      details: error.details,
      data: { compensation: "AUTH_AND_PROFILE_DELETED", uid },
    });
  }
}
