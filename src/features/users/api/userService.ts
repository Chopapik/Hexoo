import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import type { User, UserProfile } from "../types/user.type";
import { createAppError } from "@/lib/ApiError";

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

  const snap = await adminDb.doc(`users/${uid}`).get();
  const data = snap.data();

  if (!data) {
    throw createAppError({
      message: "Missing user data in createUserDocument()",
    });
  }

  return data;
}

export async function getUserByUid(uid: string): Promise<User | null> {
  const userDoc = await adminDb.collection("users").doc(uid).get();

  if (!userDoc.exists) return null;

  return userDoc.data() as User;
}

export async function getUserProfile(name: string) {
  if (!name) return null;

  const cleaned = name.trim().replace(/\s+/g, "");
  if (!cleaned) return null;

  const snapshot = await adminDb
    .collection("users")
    .where("name", "==", cleaned)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const userData = snapshot.docs[0].data() as User;

  const userProfile = {
    uid: userData.uid,
    name: userData.name,
    avatarUrl: userData.avatarUrl,
    lastOnline: userData.lastOnline,
    createdAt: userData.createdAt,
  };

  return { user: userProfile };
}
