import { createAppError } from "@/lib/AppError";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { isUsernameTaken } from "../utils/checkUsernameUnique";
import type { ActivityType } from "@/features/admin/api/services/activityService";
import type { AuthRepository } from "../repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import { UserRole } from "@/features/users/types/user.type";
import type { AuthService as IAuthService } from "./auth.service.interface";

const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000;

type ActivityLogger = (
  userId: string,
  action: ActivityType,
  details: string,
) => Promise<void>;
type ResetIpLimit = (ip: string) => Promise<void>;

export class AuthService implements IAuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly resetIpLimit: ResetIpLimit,
    private readonly logActivity: ActivityLogger,
  ) {}

  async logoutUser() {
    await clearSessionCookie();
    return { message: "Session cleared" };
  }

  async createSession(idToken: string, ip: string) {
    const decodedToken = await this.authRepository.verifyIdToken(idToken);

    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const userData = await this.userRepository.getUserByUid(uid);

    if (!userData) {
      throw createAppError({
        code: "USER_NOT_FOUND",
        message: `[authService.createSession] User document for UID ${uid} does not exist in Firestore.`,
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
        "User logged in via Client SDK flow",
      );
    } catch (error) {
      console.error("Failed to update user stats or log activity:", error);
    }

    try {
      await this.resetIpLimit(ip);
    } catch (error) {
      console.error("Failed to reset limits:", error);
    }

    await setSessionCookie(sessionCookie);

    return {
      user: {
        uid: userData.uid,
        email: email,
        name: userData.name,
        role: userData.role,
        avatarUrl: userData.avatarUrl,
      },
    };
  }

  async registerUser(data: { idToken: string; name: string; email: string }) {
    const { idToken, name } = data;

    const decodedToken = await this.authRepository.verifyIdToken(idToken);

    const { uid, email } = decodedToken;

    if (await isUsernameTaken(name)) {
      try {
        await this.authRepository.deleteUser(uid);
      } catch (cleanupErr) {
        console.error(
          "Failed to cleanup user from Auth after username conflict:",
          cleanupErr,
        );
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
        "Account created via Client SDK flow",
      );
    } catch (error) {
      throw createAppError({
        code: "DB_ERROR",
        message:
          "[authService.registerUser] Failed to create user document in Firestore.",
      });
    }

    const sessionCookie = await this.authRepository.createSessionCookie(
      idToken,
      SESSION_EXPIRES_MS,
    );

    await setSessionCookie(sessionCookie);

    return {
      user: {
        uid,
        name,
        email,
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

    const taken = await isUsernameTaken(normalized);

    return {
      available: !taken,
      username: normalized,
    };
  }
}
