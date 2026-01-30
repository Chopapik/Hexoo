import { createAppError } from "@/lib/AppError";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { isUsernameTaken } from "../utils/checkUsernameUnique";
import { logActivity } from "@/features/admin/api/services/activityService";
import { resetIpLimit } from "@/features/security/api/bruteForceProtectionService";
import { authRepository } from "../repositories";
import { userRepository } from "@/features/users/api/repositories";
import { UserRole } from "@/features/users/types/user.type";

const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000;

export async function logoutUser() {
  await clearSessionCookie();
  return { message: "Session cleared" };
}

export async function createSession(idToken: string, ip: string) {
  const decodedToken = await authRepository.verifyIdToken(idToken);

  const uid = decodedToken.uid;
  const email = decodedToken.email;

  const userData = await userRepository.getUserByUid(uid);

  if (!userData) {
    throw createAppError({
      code: "USER_NOT_FOUND",
      message: `[authService.createSession] User document for UID ${uid} does not exist in Firestore.`,
    });
  }

  if (userData.isBanned) {
    await logActivity(uid, "LOGIN_FAILED", "Login attempt on banned account");
    throw createAppError({
      code: "ACCOUNT_BANNED",
      message: "[authService.createSession] User is banned",
    });
  }

  const sessionCookie = await authRepository.createSessionCookie(
    idToken,
    SESSION_EXPIRES_MS,
  );

  try {
    await logActivity(
      uid,
      "LOGIN_SUCCESS",
      "User logged in via Client SDK flow",
    );
  } catch (error) {
    console.error("Failed to update user stats or log activity:", error);
  }

  try {
    await resetIpLimit(ip);
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

export async function registerUser(data: {
  idToken: string;
  name: string;
  email: string;
}) {
  const { idToken, name } = data;

  const decodedToken = await authRepository.verifyIdToken(idToken);

  const { uid, email } = decodedToken;

  if (await isUsernameTaken(name)) {
    try {
      await authRepository.deleteUser(uid);
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
    await userRepository.createUser({
      uid,
      name,
      email: email ?? "",
      role: UserRole.User,
    });

    await logActivity(
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

  const sessionCookie = await authRepository.createSessionCookie(
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
