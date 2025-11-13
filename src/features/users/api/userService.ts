import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import type { User } from "../types/user.type";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { cookies } from "next/headers";
import { UserError } from "@/features/users/api/errors/UserError";

function createCriticalError() {
  return new UserError("Nie udało się wykonać operacji — spróbuj ponownie.", {
    code: 500,
    type: "critical",
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
    console.error("Błąd krytyczny przy deleteCurrentUser:", error);
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
  try {
    const userDoc = {
      uid,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await adminDb.doc(`users/${uid}`).set(userDoc, { merge: true });
    return userDoc;
  } catch (err) {
    console.error("Błąd podczas tworzenia usera:", err);
    throw createCriticalError();
  }
}

export async function getUserByUid(uid: string) {
  try {
    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return null;
    }

    return userDoc.data() as User;
  } catch (error) {
    console.error("Błąd podczas pobierania usera:", error);
    throw new UserError("Nie udało się pobrać danych użytkownika.", {
      code: 500,
      type: "fetch",
    });
  }
}
