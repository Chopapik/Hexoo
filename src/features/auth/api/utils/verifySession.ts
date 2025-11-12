import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import type { UserSessionData } from "@/features/users/types/user.type";

export async function getUserFromSession(): Promise<UserSessionData | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data();

    if (!userData) {
      throw new Error("Nie znaleziono usera w verifySession");
    }

    return {
      name: userData.name,
      role: userData.role,
      avatarUrl: userData.avatarUrl,
    };
  } catch (err) {
    console.error("verifySessionCookie failed", err);
    return null;
  }
}
