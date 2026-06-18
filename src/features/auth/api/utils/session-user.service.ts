import { createAppError } from "@/lib/AppError";
import { getSessionCookie } from "./session.cookies";
import { logActivity } from "@/features/activity/api/services";
import { authRepository } from "../repositories";
import { userRepository } from "@/features/users/api/repositories";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import { UserRole } from "@/features/users/types/user.type";
import type { SessionData } from "@/features/me/me.type";

export async function getUserFromSession(): Promise<SessionData | never> {
  const sessionCookie = await getSessionCookie();

  if (!sessionCookie.session) {
    throw createAppError({
      code: "AUTH_REQUIRED",
      message: "[getUserFromSession] No session cookie found.",
    });
  }

  const decoded = await authRepository
    .verifyIdToken(sessionCookie.value)
    .catch(() => {
      throw createAppError({
        message:
          "[getUserFromSession] Invalid or expired session cookie",
        code: "INVALID_SESSION",
      });
    });

  const userData = await userRepository.getUserByUid(decoded.uid);

  if (!userData) {
    await logActivity(
      decoded.uid,
      "LOGIN_FAILED",
      "Session cookie for user without profile record",
    );
    throw createAppError({
      message: "[getUserFromSession] User not found in database",
      code: "USER_NOT_FOUND",
    });
  }

  if (userData.isBanned) {
    throw createAppError({
      message: "[getUserFromSession] User account is banned",
      code: "ACCOUNT_BANNED",
    });
  }

  return {
    uid: userData.uid,
    email: userData.email ?? "",
    name: userData.name,
    role: userData.role,
    avatarUrl: resolveImagePublicUrl(userData.avatarMeta) ?? undefined,
    lastOnline: userData.lastOnline,
    isRestricted: userData.isRestricted ?? false,
    isBanned: userData.isBanned,
  };
}

export async function getOptionalUserFromSession(): Promise<SessionData | null> {
  return getUserFromSession().catch(() => null);
}

export function ensureAdminSession(session: SessionData): SessionData {
  if (session.role !== UserRole.Admin) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "[ensureAdminSession] Admin role required",
    });
  }

  return session;
}

export async function getAdminFromSession(): Promise<SessionData> {
  return ensureAdminSession(await getUserFromSession());
}
