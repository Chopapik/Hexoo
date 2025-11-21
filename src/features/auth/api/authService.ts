import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import {
  LoginData,
  LoginSchema,
  RegisterData,
  RegisterSchema,
} from "../types/auth.types";
import { signInWithPassword } from "./utils/firebaseAuthAPI";
import { createAppError } from "@/lib/ApiError";
import { validateAuthData } from "./utils/validateAuthData";
import admin from "firebase-admin";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { isUsernameTaken } from "./utils/checkUsernameUnique";
import { formatZodErrorFlat } from "@/lib/zod";
import { processRegistrationError } from "./errors/processRegistrationError";

const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000;

export async function logoutUser() {
  await clearSessionCookie();
  return { message: "Session cleared" };
}

export async function loginUser(userLoginData: LoginData) {
  const parsed = LoginSchema.safeParse(userLoginData);

  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "Invalid register credentails",
      data: {
        code: "auth/validation_failed",
        details: formatZodErrorFlat(parsed.error),
      },
    });
  }

  const resp = await signInWithPassword(
    userLoginData.email,
    userLoginData.password
  );

  const sessionCookie = await adminAuth.createSessionCookie(resp.idToken!, {
    expiresIn: SESSION_EXPIRES_MS,
  });

  const userDoc = await adminDb.collection("users").doc(resp.localId).get();

  if (!userDoc.exists) {
    throw createAppError({
      code: "USER_NOT_FOUND",
      message: "User does not exist in loginUser()",
    });
  }

  const userSnap = userDoc.data()!;
  const user = {
    uid: userSnap.uid,
    email: resp.email,
    name: userSnap.name,
    role: userSnap.role,
  };

  await setSessionCookie(sessionCookie);

  return { user };
}

export async function registerUser(userRegisterData: RegisterData) {
  const parsed = RegisterSchema.safeParse(userRegisterData);

  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      data: {
        code: "auth/validation_failed",
        details: formatZodErrorFlat(parsed.error),
      },
    });
  }

  const { email, password, name } = parsed.data;

  if (await isUsernameTaken(name)) {
    throw createAppError({
      code: "CONFLICT",
      data: { code: "username_taken", field: "name" },
    });
  }

  const authUser = await adminAuth
    .createUser({
      email,
      password,
      displayName: name,
    })
    .catch(processRegistrationError);

  await adminDb.collection("users").doc(authUser.uid).set({
    uid: authUser.uid,
    email,
    name,
    nameLowercase: name.toLowerCase(),
    role: "user",
    isBanned: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const { idToken } = await signInWithPassword(email, password);
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: 60 * 60 * 24 * 7 * 1000,
  });

  await setSessionCookie(sessionCookie);

  return {
    user: {
      uid: authUser.uid,
      name,
      email,
      role: "user" as const,
    },
  };
}
