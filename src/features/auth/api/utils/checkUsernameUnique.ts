import { adminDb } from "@/lib/firebaseAdmin";

export async function isUsernameTaken(username: string): Promise<boolean> {
  if (!username) return true;

  const normalized = username.trim().toLowerCase();

  const snapshot = await adminDb
    .collection("users")
    .where("nameLowercase", "==", normalized)
    .limit(1)
    .get();

  return !snapshot.empty;
}
