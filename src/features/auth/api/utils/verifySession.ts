import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/ApiError";
import type { UserSessionData } from "@/features/users/types/user.type";

export async function getUserFromSession(): Promise<UserSessionData> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    throw createAppError({
      message: "Missing session cookie",
      code: "NO_SESSION",
      status: 401,
    });
  }

  const decoded = await adminAuth.verifySessionCookie(session, true);

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
