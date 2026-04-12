import { createAppError } from "@/lib/AppError";
import {
  setSessionCookie,
  setRefreshCookie,
  clearAllAuthCookies,
  getSessionCookie,
  getRefreshCookie,
} from "@/lib/session";
import { isUsernameTaken } from "../utils/checkUsernameUnique";
import { isUsernameBlocked } from "../../constants/blockedUsernames";
import type { ActivityType } from "@/features/activity/api/services";
import type { AuthRepository } from "../repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import { UserRole } from "@/features/users/types/user.type";
import type { AuthService as IAuthService } from "./auth.service.interface";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import type { SessionData } from "@/features/me/me.type";

const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000;

type ActivityLogger = (
  userId: string,
  action: ActivityType,
  details: string,
) => Promise<void>;

export class AuthService implements IAuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly logActivity: ActivityLogger,
  ) {}

  async logoutUser() {
    try {
      const session = await getSessionCookie();
      if (session.session && session.value) {
        const decoded = await this.authRepository.verifyIdToken(session.value);
        await this.logActivity(decoded.uid, "LOGOUT", "User logged out");
      }
    } catch {
      // Ignore: no valid session to log
    }
    await clearAllAuthCookies();
    return { message: "Session cleared" };
  }

  /** Try to refresh session using refresh token cookie. Returns user data or null; clears cookies on failure. */
  async tryRefreshSession(): Promise<SessionData | null> {
    const refresh = await getRefreshCookie();
    if (!refresh.hasRefresh) return null;
    try {
      const tokens = await this.authRepository.refreshSession(refresh.value);
      await setSessionCookie(tokens.access_token);
      await setRefreshCookie(tokens.refresh_token);
      const decoded = await this.authRepository.verifyIdToken(tokens.access_token);
      const userData = await this.userRepository.getUserByUid(decoded.uid);
      if (!userData || userData.isBanned) return null;
      return {
        uid: userData.uid,
        email: userData.email ?? "",
        name: userData.name,
        role: userData.role,
        avatarUrl: resolveImagePublicUrl(userData.avatarMeta) ?? undefined,
        isRestricted: userData.isRestricted ?? false,
        isBanned: userData.isBanned,
      };
    } catch {
      await clearAllAuthCookies();
      return null;
    }
  }

  async createSession(idToken: string, ip: string, refreshToken?: string) {
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
      await this.logActivity(
        uid,
        "LOGIN_SUCCESS",
        "User logged in",
      );
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
      user: {
        uid: userData.uid,
        email: email ?? undefined,
        name: userData.name,
        role: userData.role,
        avatarUrl: resolveImagePublicUrl(userData.avatarMeta) ?? undefined,
      },
    };
  }

  async registerUser(data: {
    idToken: string;
    name: string;
    email: string;
    refreshToken?: string;
  }) {
    const { idToken, name } = data;

    const decodedToken = await this.authRepository.verifyIdToken(idToken);

    const { uid, email } = decodedToken;

    if (isUsernameBlocked(name)) {
      try {
        await this.authRepository.deleteUser(uid);
      } catch (cleanupErr) {
        throw createAppError({
          code: "INTERNAL_ERROR",
          message: "Failed to cleanup user from Auth after blocked username attempt",
          details: cleanupErr,
        });
      }

      throw createAppError({
        code: "CONFLICT",
        message: `[authService.registerUser] Username '${name}' is not available.`,
        details: { field: "name" },
      });
    }

    if (await isUsernameTaken(name)) {
      try {
        await this.authRepository.deleteUser(uid);
        await this.logActivity(
          uid,
          "LOGIN_FAILED",
          "User cleanup after username conflict",
        );
      } catch (cleanupErr) {
        throw createAppError({
          code: "INTERNAL_ERROR",
          message: "Failed to cleanup user from Auth after username conflict",
          details: cleanupErr,
        });
      }

      throw createAppError({
        code: "CONFLICT",
        message: `[authService.registerUser] Username '${name}' is already taken.`,
        details: { field: "name" },
      });
    }

    try {
      await this.userRepository.createUser({
        uid,
        name,
        email: email ?? "",
        role: UserRole.User,
      });

      await this.logActivity(
        uid,
        "USER_CREATED",
        "Account created",
      );
    } catch (error) {
      throw createAppError({
        code: "DB_ERROR",
        message:
          "[authService.registerUser] Failed to create user document in database.",
      });
    }

    const sessionCookie = await this.authRepository.createSessionCookie(
      idToken,
      SESSION_EXPIRES_MS,
    );

    await setSessionCookie(sessionCookie);
    if (data.refreshToken) await setRefreshCookie(data.refreshToken);

    return {
      user: {
        uid,
        name,
        email: email ?? undefined,
        role: "user" as const,
      },
    };
  }

  async checkEmailAvailability(email: string) {
    if (!email || typeof email !== "string") {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[auth.checkEmailAvailability] Email is required.",
      });
    }

    const normalized = email.trim().toLowerCase();

    if (normalized.length === 0) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[auth.checkEmailAvailability] Email cannot be empty.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[auth.checkEmailAvailability] Invalid email format.",
      });
    }

    const user = await this.authRepository.getUserByEmail(normalized);

    return {
      available: !user,
      email: normalized,
    };
  }

  async checkUsernameAvailability(username: string) {
    if (!username || typeof username !== "string") {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[auth.checkUsernameAvailability] Username is required.",
      });
    }

    const normalized = username.trim().toLowerCase();

    if (normalized.length === 0) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[auth.checkUsernameAvailability] Username cannot be empty.",
      });
    }

    if (isUsernameBlocked(normalized)) {
      return {
        available: false,
        username: normalized,
      };
    }

    const taken = await isUsernameTaken(normalized);

    return {
      available: !taken,
      username: normalized,
    };
  }
}
