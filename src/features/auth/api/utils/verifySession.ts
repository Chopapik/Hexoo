import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/ApiError";
import type { UserSessionData } from "@/features/users/types/user.type";
import { getSessionCookie } from "@/lib/session";

export async function getUserFromSession(): Promise<
  UserSessionData | undefined
> {
  const session = await getSessionCookie();

  if (session) {
    const decoded = await adminAuth
      .verifySessionCookie(session, true)
      .catch(() => {
        throw createAppError({
          message: "Invalid or expired session",
          code: "INVALID_SESSION",
          status: 401,
        });
      });

    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    if (!snap.exists) {
      throw createAppError({
        message: "User not found in database",
        code: "USER_NOT_FOUND",
        status: 404,
      });
    }

    const data = snap.data();
    if (!data) {
      throw createAppError({
        message: "User document has no data",
        code: "USER_NOT_FOUND",
        status: 404,
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
}
