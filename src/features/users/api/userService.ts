import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import type { User, UserBlockData, UserProfile } from "../types/user.type";
import { createAppError } from "@/lib/ApiError";
import { ensureModeratorOrAdmin } from "@/features/moderator/api/moderatorService";

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
      code: "DB_ERROR",
      message:
        "[userService.createUserDocument] Missing user data after creation",
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
    lastOnline: (userData.lastOnline as any)?.toDate
      ? (userData.lastOnline as any).toDate()
      : userData.lastOnline,
    createdAt: (userData.createdAt as any)?.toDate
      ? (userData.createdAt as any).toDate()
      : userData.createdAt,
  };

  return { user: userProfile };
}

export const blockUser = async (data: UserBlockData) => {
  await ensureModeratorOrAdmin();

  if (!data.uidToBlock) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[userService.blockUser] No 'uidToBlock' provided",
    });
  }

  await adminAuth.updateUser(data.uidToBlock, { disabled: true });

  await adminDb.collection("users").doc(data.uidToBlock).update({
    isBanned: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    bannedBy: data.bannedBy,
    bannedReason: data.bannedReason,
  });

  return;
};

export const unblockUser = async (uid: string) => {
  await ensureModeratorOrAdmin();

  if (!uid) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[userService.unblockUser] No 'uid' provided",
    });
  }

  await adminAuth.updateUser(uid, { disabled: false });

  await adminDb.collection("users").doc(uid).update({
    isBanned: false,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    bannedBy: null,
    bannedReason: undefined,
  });

  return;
};
