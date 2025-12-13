import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/ApiError";
import type { UserSessionData } from "@/features/users/types/user.type";
import { getSessionCookie } from "@/lib/session";

export async function getUserFromSession(): Promise<UserSessionData | never> {
  const sessionCookie = await getSessionCookie();

  if (!sessionCookie.session) {
    throw createAppError({
      code: "AUTH_REQUIRED",
      message: "[verifySession.getUserFromSession] No session cookie found.",
    });
  }

  const decoded = await adminAuth
    .verifySessionCookie(sessionCookie.value, true)
    .catch(() => {
      throw createAppError({
        message:
          "[verifySession.getUserFromSession] Invalid or expired session cookie",
        code: "INVALID_SESSION",
      });
    });

  const snap = await adminDb.collection("users").doc(decoded.uid).get();
  if (!snap.exists) {
    throw createAppError({
      message: "[verifySession.getUserFromSession] User not found in database",
      code: "USER_NOT_FOUND",
    });
  }

  const data = snap.data();

  if (!data) {
    throw createAppError({
      message: "[verifySession.getUserFromSession] User document has no data",
      code: "USER_NOT_FOUND",
    });
  }

  return {
    uid: data.uid,
    email: data.email,
    name: data.name,
    role: data.role,
    avatarUrl: data.avatarUrl,
    isRestricted: data.isRestricted || false,
  };
}
