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
import {
  ActivityType,
  logActivity,
} from "@/features/admin/api/activityService";

const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000;

export async function logoutUser() {
  await clearSessionCookie();
  return { message: "Session cleared" };
}
export async function loginUser(userLoginData: LoginData) {
  const parsed = LoginSchema.safeParse(userLoginData);
  const { email, password } = userLoginData;

  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      data: {
        code: "auth/validation_failed",
        details: formatZodErrorFlat(parsed.error),
      },
    });
  }

  const userSnapshot = await adminDb
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  if (userSnapshot.empty) {
    throw createAppError({
      code: "INVALID_CREDENTIALS",
      message: "User not found or invalid credentials",
    });
  }

  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data();
  const uid = userData.uid;

  if (userData.lockoutUntil) {
    const lockoutTime = userData.lockoutUntil.toDate();
    if (lockoutTime > new Date()) {
      await logActivity(
        uid,
        "LOGIN_FAILED" as ActivityType,
        `Próba logowania na zablokowane konto. Blokada do ${lockoutTime.toISOString()}`
      );

      throw createAppError({
        code: "FORBIDDEN",
        data: { lockoutTime },
      });
    } else {
      await userDoc.ref.update({
        failedLoginAttempts: 0,
        lockoutUntil: null,
      });

      userData.failedLoginAttempts = 0;
    }
  }

  try {
    const resp = await signInWithPassword(email, password);

    await userDoc.ref.update({
      failedLoginAttempts: 0,
      lockoutUntil: null,
    });
    await logActivity(
      uid,
      "LOGIN_SUCCESS" as ActivityType,
      "Użytkownik zalogowany pomyślnie"
    );

    const sessionCookie = await adminAuth.createSessionCookie(resp.idToken!, {
      expiresIn: SESSION_EXPIRES_MS,
    });

    const dbUserDoc = await adminDb
      .collection("users")
      .doc(resp.localId!)
      .get();

    if (!dbUserDoc.exists) {
      throw createAppError({
        code: "USER_NOT_FOUND",
        message: "User does not exist in loginUser()",
      });
    }

    const userSnap = dbUserDoc.data()!;
    const user = {
      uid: userSnap.uid,
      email: resp.email,
      name: userSnap.name,
      role: userSnap.role,
    };

    await setSessionCookie(sessionCookie);

    return { user };
  } catch (error: any) {
    const MAX_ATTEMPTS = 3;

    const currentAttempts = (userData.failedLoginAttempts || 0) + 1;
    let updateData: any = { failedLoginAttempts: currentAttempts };

    if (currentAttempts >= MAX_ATTEMPTS) {
      const lockoutDate = new Date();
      lockoutDate.setMinutes(lockoutDate.getMinutes() + 15);
      updateData.lockoutUntil = admin.firestore.Timestamp.fromDate(lockoutDate);

      await logActivity(
        uid,
        "USER_BLOCKED" as ActivityType,
        `Konto zablokowane na 15 min po ${currentAttempts} nieudanych próbach`
      );
    } else {
      await logActivity(
        uid,
        "LOGIN_FAILED" as ActivityType,
        `Błędne hasło (Próba ${currentAttempts}/${MAX_ATTEMPTS})`
      );
    }

    await userDoc.ref.update(updateData);

    // Rzucamy oryginalny błąd
    throw error;
  }
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
      data: { code: "auth/username_taken", field: "name" },
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
