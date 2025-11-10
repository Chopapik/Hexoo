import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { RegisterData } from "../types/auth.types";
import admin from "firebase-admin";
import { FirebaseAuthError } from "firebase-admin/auth";
import handleRegisterError from "./handleRegisterError";
import { validateField } from "../utils/registerValidation";

export async function registerUser(userRegisterData: RegisterData) {
  let uid: string | null = null;

  try {
    const user = await adminAuth.createUser({
      email: userRegisterData.email,
      password: userRegisterData.password,
      displayName: userRegisterData.name,
    });

    uid = user.uid;

    await adminDb.doc(`users/${uid}`).set(
      {
        uid,
        name: userRegisterData.name,
        email: userRegisterData.email,
        role: "user",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const token = await adminAuth.createCustomToken(uid);
    return { ok: true, token };
  } catch (error) {
    if (uid) {
      try {
        await adminAuth.deleteUser(uid);
        console.warn(
          `Rollback: użytkownik ${uid} został usunięty po błędzie Firestore.`
        );
      } catch (rollbackError) {
        console.error("Błąd podczas rollbacku użytkownika:", rollbackError);
      }
    }

    if (error instanceof FirebaseAuthError) {
      throw {
        ok: false,
        data: handleRegisterError(error),
        type: "validation",
        code: 400,
      };
    }

    console.error("Błąd rejestracji użytkownika:", error);
    throw {
      ok: false,
      message: "Wystąpił błąd serwera",
      type: "critical",
      code: 500,
    };
  }
}
