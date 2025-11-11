import { adminAuth } from "@/lib/firebaseAdmin";
import { FirebaseAuthError } from "firebase-admin/auth";
import formatRegistrationError from "./formatRegistrationError";
import { AuthError } from "./AuthError";

export async function processRegistrationError(error: any, uid: string | null) {
  if (uid) {
    try {
      await adminAuth.deleteUser(uid);
      console.warn(`Rollback: użytkownik ${uid} został usunięty po błędzie.`);
    } catch (rollbackError) {
      console.error("Błąd podczas rollbacku użytkownika:", rollbackError);
    }
  }

  if (error instanceof FirebaseAuthError) {
    const data = formatRegistrationError(error);
    throw new AuthError(data.message ?? "Błąd walidacji", {
      code: 400,
      type: "validation",
      data,
    });
  }

  console.error("Błąd rejestracji użytkownika:", error);
  throw new AuthError("Wystąpił błąd serwera", {
    code: 500,
    type: "critical",
  });
}
