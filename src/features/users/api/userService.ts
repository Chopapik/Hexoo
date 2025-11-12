import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import type { User } from "../types/user.type";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { AuthError } from "@/features/auth/api/errors/AuthError";
import { cookies } from "next/headers";

function createCriticalError() {
  return new AuthError("Nie udało się wykonać operacji — spróbuj ponownie.", {
    code: 400,
    type: "validation",
  });
}

export async function deleteCurrentUser(): Promise<{ ok: true } | never> {
  try {
    const decoded = await getUserFromSession();
    if (!decoded) {
      console.error("Nie udało się uzyskać UID użytkownika");
      throw createCriticalError();
    }

    await adminDb.collection("users").doc(decoded.uid).delete();

    await adminAuth.deleteUser(decoded.uid);

    const cookieStore = await cookies();
    cookieStore.delete("session");
    return { ok: true };
  } catch (error) {
    console.error(
      "Błąd krytyczy podczas wykonywania deleteCurrentUser: ",
      error
    );
    throw createCriticalError();
  }
}
export async function createUserDocument(
  uid: string,
  userData: {
    name: string;
    email: string;
    role: string;
  }
) {
  const userDoc = {
    uid,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await adminDb.doc(`users/${uid}`).set(userDoc, { merge: true });
  return userDoc;
}

export async function getUserByUid(uid: string) {
  try {
    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      console.error(`Brak uzytkownika o id ${uid}`);
      return null;
    }
    const userData = userDoc.data() as User;
    return userData;
  } catch (error) {
    console.error("Error fetching user with admin:", error);
    throw new Error(
      `Failed to fetch user data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
