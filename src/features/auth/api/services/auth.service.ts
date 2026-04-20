import { createAppError } from "@/lib/AppError";
import {
  setSessionCookie,
  setRefreshCookie,
  clearAllAuthCookies,
  getSessionCookie,
  getRefreshCookie,
} from "@/features/auth/api/utils/session.cookies";
import { isUsernameTaken } from "../utils/checkUsernameUnique";
import { isUsernameBlocked } from "../../constants/blockedUsernames";
import type { ActivityType } from "@/features/activity/api/services";
import type { AuthRepository } from "../repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import { UserRole } from "@/features/users/types/user.type";
import type {
  AuthService as IAuthService,
  CompleteOAuthProfileResult,
  OAuthLoginResult,
  OAuthSessionUser,
} from "./auth.service.interface";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import type { SessionData } from "@/features/me/me.type";
import type { UserEntity } from "@/features/users/types/user.entity";

const SESSION_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

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

  /** Restore session using refresh token cookie. Returns user data or null; clears cookies on failure. */
  async restoreUserSession(): Promise<SessionData | null> {
    const refresh = await getRefreshCookie();
    if (!refresh.hasRefresh) return null;
    try {
      const tokens = await this.authRepository.refreshSession(refresh.value);
      await setSessionCookie(tokens.access_token);
      await setRefreshCookie(tokens.refresh_token);
      const decoded = await this.authRepository.verifyIdToken(
        tokens.access_token,
      );
      const userData = await this.userRepository.getUserByUid(decoded.uid);
      if (!userData || userData.isBanned) {
        await clearAllAuthCookies();
        return null;
      }
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

  async createSession(idToken: string, refreshToken?: string) {
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
          message:
            "Failed to cleanup user from Auth after blocked username attempt",
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

      await this.logActivity(uid, "USER_CREATED", "Account created");
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

  /**
   * Creates app session cookies for a verified user.
   */
  private async issueAppSession(params: {
    userData: UserEntity;
    idToken: string;
    refreshToken?: string;
    email?: string | null;
    activityDetails: string;
  }): Promise<OAuthSessionUser> {
    const { userData, idToken, refreshToken, email, activityDetails } = params;

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

    return {
      uid: userData.uid,
      email: (email ?? userData.email) || undefined,
      name: userData.name,
      role: userData.role,
      avatarUrl: resolveImagePublicUrl(userData.avatarMeta) ?? undefined,
    };
  }

  async oauthLogin(data: {
    idToken: string;
    refreshToken?: string;
  }): Promise<OAuthLoginResult> {
    const { idToken, refreshToken } = data;

    const decoded = await this.authRepository.verifyIdToken(idToken);
    const { uid, email } = decoded;

    const existing = await this.userRepository.getUserByUid(uid);

    if (existing && existing.hasUsername) {
      const user = await this.issueAppSession({
        userData: existing,
        idToken,
        refreshToken,
        email,
        activityDetails: "User logged in via OAuth",
      });
      return { status: "LOGGED_IN", user };
    }

    if (!existing) {
      try {
        await this.userRepository.createOAuthPendingUser({
          uid,
          email: email ?? "",
        });
        await this.logActivity(
          uid,
          "USER_CREATED",
          "OAuth account created (pending username)",
        );
      } catch (error) {
        // Another request may have created the user already.
        // Re-read and continue if the row exists.
        const reread = await this.userRepository.getUserByUid(uid);
        if (!reread) {
          throw createAppError({
            code: "DB_ERROR",
            message:
              "[authService.oauthLogin] Failed to create pending OAuth user record.",
            details: error,
          });
        }
        if (reread.hasUsername) {
          const user = await this.issueAppSession({
            userData: reread,
            idToken,
            refreshToken,
            email,
            activityDetails: "User logged in via OAuth",
          });
          return { status: "LOGGED_IN", user };
        }
      }
    }

    return {
      status: "NEEDS_USERNAME",
      uid,
      email: email ?? undefined,
    };
  }

  async completeOAuthProfile(data: {
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
      const user = await this.issueAppSession({
        userData: existing,
        idToken,
        refreshToken,
        email,
        activityDetails: "User logged in via OAuth (already onboarded)",
      });
      return { user };
    }

    if (isUsernameBlocked(trimmed)) {
      throw createAppError({
        code: "CONFLICT",
        message: `[authService.completeOAuthProfile] Username '${trimmed}' is not available.`,
        details: { field: "name" },
      });
    }

    if (await isUsernameTaken(trimmed)) {
      throw createAppError({
        code: "CONFLICT",
        message: `[authService.completeOAuthProfile] Username '${trimmed}' is already taken.`,
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

    const user = await this.issueAppSession({
      userData: refreshed,
      idToken,
      refreshToken,
      email,
      activityDetails: "User completed OAuth onboarding",
    });

    return { user };
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
