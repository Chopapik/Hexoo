import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/AppError";
import admin from "firebase-admin";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { isUsernameTaken } from "./utils/checkUsernameUnique";
import { logActivity } from "@/features/admin/api/activityService";

const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000;

export async function logoutUser() {
  await clearSessionCookie();
  return { message: "Session cleared" };
}
export async function createSession(idToken: string) {
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    throw createAppError({
      code: "INVALID_CREDENTIALS",
      message:
        "[authService.createSession] Failed to verify Firebase ID Token during login.",
    });
  }

  const uid = decodedToken.uid;
  const email = decodedToken.email;

  const userDocRef = adminDb.collection("users").doc(uid);
  const userDoc = await userDocRef.get();

  if (!userDoc.exists) {
    throw createAppError({
      code: "USER_NOT_FOUND",
      message: `[authService.createSession] User document for UID ${uid} does not exist in Firestore.`,
    });
  }

  const userData = userDoc.data()!;

  if (userData.isBanned) {
    await logActivity(uid, "LOGIN_FAILED", "Login attempt on banned account");
    throw createAppError({
      code: "FORBIDDEN",
      message: "[authService.createSession] User is banned",
    });
  }

  if (userData.lockoutUntil) {
    const lockoutTime = userData.lockoutUntil.toDate();
    if (lockoutTime > new Date()) {
      throw createAppError({
        code: "FORBIDDEN",
        message: "[authService.createSession] Account is locked",
        details: { lockoutTime },
      });
    } else {
      await userDocRef.update({ lockoutUntil: null, failedLoginAttempts: 0 });
    }
  }

  let sessionCookie;
  try {
    sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });
  } catch (error) {
    throw createAppError({
      code: "INTERNAL_ERROR",
      message:
        "[authService.createSession] Failed to create session cookie via Admin SDK.",
      details: error,
    });
  }

  try {
    await userDocRef.update({
      failedLoginAttempts: 0,
      lockoutUntil: null,
      lastOnline: admin.firestore.FieldValue.serverTimestamp(),
    });

    await logActivity(
      uid,
      "LOGIN_SUCCESS",
      "User logged in via Client SDK flow"
    );
  } catch (error) {
    console.error("Failed to update user stats or log activity:", error);
  }

  await setSessionCookie(sessionCookie);

  return {
    user: {
      uid: userData.uid,
      email: email,
      name: userData.name,
      role: userData.role,
      avatarUrl: userData.avatarUrl,
    },
  };
}

export async function registerUser(data: {
  idToken: string;
  name: string;
  email: string;
}) {
  const { idToken, name } = data;

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    throw createAppError({
      code: "INVALID_CREDENTIALS",
      message:
        "[authService.registerUser] Failed to verify Firebase ID Token during registration.",
      details: error,
    });
  }

  const { uid, email } = decodedToken;

  if (await isUsernameTaken(name)) {
    try {
      await adminAuth.deleteUser(uid);
    } catch (cleanupErr) {
      console.error(
        "Failed to cleanup user from Auth after username conflict:",
        cleanupErr
      );
    }

    throw createAppError({
      code: "CONFLICT",
      message: `[authService.registerUser] Username '${name}' is already taken.`,
      details: { field: "name" },
    });
  }

  try {
    await adminDb.collection("users").doc(uid).set(
      {
        uid,
        email,
        name,
        nameLowercase: name.toLowerCase(),
        role: "user",
        isBanned: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await logActivity(
      uid,
      "USER_CREATED",
      "Account created via Client SDK flow"
    );
  } catch (error) {
    throw createAppError({
      code: "DB_ERROR",
      message:
        "[authService.registerUser] Failed to create user document in Firestore.",
    });
  }

  let sessionCookie;
  try {
    sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });
  } catch (error) {
    throw createAppError({
      code: "INTERNAL_ERROR",
      message:
        "[authService.registerUser] Failed to create session cookie after registration.",
    });
  }

  await setSessionCookie(sessionCookie);

  return {
    user: {
      uid,
      name,
      email,
      role: "user" as const,
    },
  };
}
