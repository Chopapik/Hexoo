import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import maskEmail from "@/features/shared/utils/maskEmail";
import { AdminUserCreate } from "../types/admin.type";
import { createAppError } from "@/lib/ApiError";
import admin from "firebase-admin";

const ensureAdmin = async () => {
  const session = await getUserFromSession();

  if (!session) {
    throw createAppError({
      code: "AUTH_REQUIRED",
      message: "No session.",
    });
  }

  if (session.role !== "admin") {
    throw createAppError({
      code: "FORBIDDEN",
      message: "Admin role required.",
    });
  }
};

export const adminDeleteUser = async (uid: string) => {
  await ensureAdmin();

  if (!uid) {
    throw createAppError({
      message: "No 'uid' provided for deletion",
    });
  }

  await adminAuth.deleteUser(uid);

  await adminDb.collection("users").doc(uid).delete();

  return { success: true, uid };
};

export const adminCreateUserAccount = async (data: AdminUserCreate) => {
  await ensureAdmin();

  if (!data?.email || !data?.password || !data?.name) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "Empty create user credentials",
      data: { code: "admin/empty_create_user_account_credentials" },
    });
  }

  const userRecord = await adminAuth.createUser({
    email: data.email,
    password: data.password,
    displayName: data.name,
  });

  const uid = userRecord.uid;

  const userDoc = {
    uid,
    email: data.email,
    maskedEmail: maskEmail(data.email),
    name: data.name,
    role: data.role ?? "user",
    isBanned: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await adminDb.collection("users").doc(uid).set(userDoc, { merge: true });

  return {
    uid,
    email: maskEmail(data.email),
    displayName: data.name,
    role: data.role ?? "user",
  };
};

export const adminGetAllUsers = async () => {
  await ensureAdmin();

  const snapshot = await adminDb.collection("users").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      uid: doc.id,
      name: data?.name ?? null,
      email: maskEmail(data?.email ?? ""),
      role: data?.role ?? "user",
      createdAt: data?.createdAt?.toDate
        ? data.createdAt.toDate()
        : data?.createdAt,
      isBanned: Boolean(data?.isBanned),
    };
  });
};

export const adminUpdateUserAccount = async (
  uid: string,
  data: { name?: string; email?: string; role?: string }
) => {
  await ensureAdmin();

  if (!uid) {
    throw createAppError({
      message: "No 'uid' in adminUpdateUserAccount",
    });
  }

  const updatePayload: Record<string, any> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (data.name?.trim()) updatePayload.name = data.name.trim();
  if (data.role?.trim()) updatePayload.role = data.role.trim();
  if (data.email?.trim()) {
    updatePayload.email = data.email.trim();
    updatePayload.maskedEmail = maskEmail(data.email.trim());
  }

  await adminDb.collection("users").doc(uid).update(updatePayload);

  const authUpdate: Record<string, any> = {};
  if (updatePayload.name) authUpdate.displayName = updatePayload.name;
  if (updatePayload.email) authUpdate.email = updatePayload.email;

  if (Object.keys(authUpdate).length > 0) {
    await adminAuth.updateUser(uid, authUpdate);
  }

  return;
};

export const adminUpdateUserPassword = async (
  uid: string,
  newPassword: string
) => {
  await ensureAdmin();

  if (!uid) {
    throw createAppError({
      message: "No 'uid' in adminUpdateUserPassword",
    });
  }

  if (!uid || !newPassword || newPassword.length < 8) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      data: { code: "admin/empty_create_user_account_credentials" },
    });
  }

  await adminAuth.updateUser(uid, { password: newPassword });

  await adminDb
    .collection("users")
    .doc(uid)
    .set(
      { updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

  return;
};
