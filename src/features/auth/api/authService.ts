import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { LoginData, RegisterData } from "../types/auth.types";
import { createUserDocument } from "@/features/users/api/userService";
import { signInWithPassword } from "./utils/firebaseAuthAPI";
import { cookies } from "next/headers";
import { createAppError } from "@/lib/ApiError";
import { validateAuthData } from "./utils/validateAuthData";
import { processRegistrationError } from "./errors/processRegistrationError";

const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000;

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { ok: true, message: "Session cleared" };
}

export async function loginUser(userLoginData: LoginData) {
  if (!validateAuthData<LoginData>(userLoginData)) {
    throw createAppError({
      message: "Missing fields in loginUser()",
      code: "VALIDATION_ERROR",
      details: { code: "auth/missing_fields", field: "root" },
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
      message: "User does not exist",
      status: 404,
    });
  }

  const userSnap = userDoc.data()!;
  const user = {
    uid: userSnap.uid,
    email: resp.email,
    name: userSnap.name,
    role: userSnap.role,
  };

  return { ok: true, user, sessionCookie };
}

export async function registerUser(userRegisterData: RegisterData) {
  if (!validateAuthData<RegisterData>(userRegisterData)) {
    throw createAppError({
      message: "Missing fields in registerUser()",
      code: "VALIDATION_ERROR",
      details: { code: "auth/missing_fields", field: "root" },
    });
  }

  const authUser = await adminAuth
    .createUser({
      email: userRegisterData.email,
      password: userRegisterData.password,
      displayName: userRegisterData.name,
    })
    .catch(processRegistrationError);

  const dbUser = await createUserDocument(authUser.uid, {
    name: userRegisterData.name,
    email: userRegisterData.email,
    role: "user",
  });

  const resp = await signInWithPassword(
    userRegisterData.email,
    userRegisterData.password
  );

  const sessionCookie = await adminAuth.createSessionCookie(resp.idToken!, {
    expiresIn: SESSION_EXPIRES_MS,
  });

  const user = {
    uid: dbUser.uid,
    name: dbUser.name,
    role: dbUser.role,
  };

  return { ok: true, user, sessionCookie };
}
