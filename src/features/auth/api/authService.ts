import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { LoginData, RegisterData } from "../types/auth.types";
import { createUserDocument } from "@/features/users/api/userService";
import { processRegistrationError } from "./errors/processRegistrationError";
import { AuthError } from "./errors/AuthError";
import { signInWithPassword } from "./utils/firebaseAuthAPI";
import { cookies } from "next/headers";
import { createAppError } from "@/lib/ApiError";

const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000;

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
  } catch (error) {
    console.error(error);
    throw new AuthError("Wystąpił krytyczny błąd podczas wylogowania", {
      code: 500,
      type: "critical",
    });
  }
}

export async function loginUser(userLoginData: LoginData) {
  try {
    const resp = await signInWithPassword(
      userLoginData.email,
      userLoginData.password
    );
    const idToken = resp?.idToken;
    if (!idToken)
      throw createAppError({
        message: "Missing idToken in loginUser() within authService",
      });

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });

    if (!sessionCookie) {
      throw createAppError({
        message:
          "sessionCookie does not exist in loginUser() within authService",
      });
    }

    const userDoc = await adminDb.collection("users").doc(resp.localId).get();

    if (!userDoc.exists) {
      throw createAppError({
        message: "User does not exist in loginUser() within authService",
      });
    }
    const userSnap = userDoc.data();

    if (userSnap) {
      const user = {
        uid: userSnap.uid,
        email: resp.email,
        name: userSnap.name,
        role: userSnap.role,
      };
      return { ok: true, user, sessionCookie };
    }
  } catch (error) {
    throw error;
  }
}

export async function createAuthUser(userData: {
  email: string;
  password: string;
  displayName: string;
}) {
  return adminAuth.createUser({
    email: userData.email,
    password: userData.password,
    displayName: userData.displayName,
  });
}

export async function registerUser(userRegisterData: RegisterData) {
  let uid: string | null = null;

  try {
    const user = await createAuthUser({
      email: userRegisterData.email,
      password: userRegisterData.password,
      displayName: userRegisterData.name,
    });

    uid = user.uid;

    await createUserDocument(uid, {
      name: userRegisterData.name,
      email: userRegisterData.email,
      role: "user",
    });

    const resp = await signInWithPassword(
      userRegisterData.email,
      userRegisterData.password
    );
    const idToken = resp?.idToken;
    if (!idToken) throw new Error("Brak idToken od Firebase");

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });

    const token = await adminAuth.createCustomToken(uid);
    return { ok: true, user, sessionCookie };
  } catch (error) {
    await processRegistrationError(error, uid);
  }
}
