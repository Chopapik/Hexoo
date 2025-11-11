import { adminAuth } from "@/lib/firebaseAdmin";
import { LoginData, RegisterData } from "../types/auth.types";
import { createUserDocument } from "@/features/users/api/userService";
import { processRegistrationError } from "./errors/processRegistrationError";
import { processLoginError } from "./errors/processLoginError";
import { AuthError } from "./errors/AuthError";
import { signInWithPassword } from "./utils/firebaseAuthAPI";

const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000;

export async function loginUser(userLoginData: LoginData) {
  try {
    const resp = await signInWithPassword(
      userLoginData.email,
      userLoginData.password
    );
    const idToken = resp?.idToken;
    if (!idToken) throw new Error("Brak idToken od Firebase");

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });

    const user = {
      uid: resp.uid,
      email: resp.email,
      displayName: resp.displayName,
    };

    return { ok: true, user, sessionCookie };
  } catch (error) {
    await processLoginError(error);
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

    const token = await adminAuth.createCustomToken(uid);
    return { ok: true, token };
  } catch (error) {
    await processRegistrationError(error, uid);
  }
}
