import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/ApiError";
import type { UserSessionData } from "@/features/users/types/user.type";
import { getSessionCookie } from "@/lib/session";

export async function getUserFromSession(): Promise<UserSessionData | never> {
  const sessionCookie = await getSessionCookie();

  if (!sessionCookie.session) {
    throw createAppError({
      code: "AUTH_REQUIRED",
    });
  }

  const decoded = await adminAuth
    .verifySessionCookie(sessionCookie.value, true)
    .catch(() => {
      throw createAppError({
        message: "Invalid or expired session",
        code: "INVALID_SESSION",
      });
    });

  const snap = await adminDb.collection("users").doc(decoded.uid).get();
  if (!snap.exists) {
    throw createAppError({
      message: "User not found in database",
      code: "USER_NOT_FOUND",
    });
  }

  const data = snap.data();
  if (!data) {
    throw createAppError({
      message: "User document has no data",
      code: "USER_NOT_FOUND",
    });
  }

  return {
    uid: data.uid,
    email: data.email,
    name: data.name,
    role: data.role,
    avatarUrl: data.avatarUrl,
  };
}
