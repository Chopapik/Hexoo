import { createAppError } from "@/lib/AppError";
import { clearAllAuthCookies, getSessionCookie } from "./session.cookies";
import { cookies } from "next/headers";
import { logActivity } from "@/features/activity/api/services";
import { authRepository } from "../repositories";
import { userRepository } from "@/features/users/api/repositories";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import { UserRole } from "@/features/users/types/user.type";
import type { SessionData } from "@/features/me/me.type";
import { isTokenIssuedBeforeSessionCutoff } from "./session-cutoff";

const E2E_SESSION_COOKIE_NAME = "__hexoo_e2e_session";

function isSessionRole(value: unknown): value is UserRole {
  return (
    value === UserRole.Admin ||
    value === UserRole.Moderator ||
    value === UserRole.User
  );
}

function parseE2ESessionCookie(value: string): SessionData | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as Partial<SessionData>;

    if (
      typeof parsed.uid !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.name !== "string" ||
      !isSessionRole(parsed.role)
    ) {
      return null;
    }

    return {
      uid: parsed.uid,
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
      avatarUrl:
        typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : undefined,
      lastOnline:
        typeof parsed.lastOnline === "string"
          ? parsed.lastOnline
          : new Date().toISOString(),
      isRestricted: parsed.isRestricted === true,
      isBanned: parsed.isBanned === true,
    };
  } catch {
    return null;
  }
}

async function getE2ESessionFromCookie(): Promise<SessionData | null> {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.HEXOO_E2E_SMOKE !== "true"
  ) {
    return null;
  }

  const cookieStore = await cookies();
  const rawSession = cookieStore.get(E2E_SESSION_COOKIE_NAME)?.value;

  if (!rawSession) {
    return null;
  }

  return parseE2ESessionCookie(rawSession);
}

export async function getUserFromSession(): Promise<SessionData | never> {
  const e2eSession = await getE2ESessionFromCookie();

  if (e2eSession) {
    return e2eSession;
  }

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
        message: "[getUserFromSession] Invalid or expired session cookie",
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

  if (userData.deletedAt) {
    await clearAllAuthCookies();
    throw createAppError({
      message: "[getUserFromSession] User account was deleted",
      code: "ACCOUNT_DELETED",
    });
  }

  if (userData.isBanned) {
    throw createAppError({
      message: "[getUserFromSession] User account is banned",
      code: "ACCOUNT_BANNED",
    });
  }

  if (isTokenIssuedBeforeSessionCutoff(sessionCookie.value, userData)) {
    await clearAllAuthCookies();
    throw createAppError({
      message: "[getUserFromSession] Session token was invalidated",
      code: "INVALID_SESSION",
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
