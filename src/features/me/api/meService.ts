import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { UserProfileUpdate } from "@/features/users/types/user.type";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { PasswordUpdate } from "../me.type";
import { loginUser } from "@/features/auth/api/authService";
import { createAppError } from "@/lib/ApiError";

export async function deleteAccount(): Promise<{ ok: true }> {
  const decoded = await getUserFromSession();
  await adminDb.collection("users").doc(decoded.uid).delete();
  await adminAuth.deleteUser(decoded.uid);
  return { ok: true };
}

export async function updateProfile(data: UserProfileUpdate) {
  const decoded = await getUserFromSession();
  const uid = decoded.uid;

  const hasName = typeof data.name === "string" && data.name.trim() !== "";
  const hasAvatar =
    typeof data.avatarUrl === "string" && data.avatarUrl.trim() !== "";

  if (!hasName && !hasAvatar) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "No fields were provided for profile update.",
      details: { field: "root", reason: "no_update_fields" },
    });
  }

  const authUpdate: { displayName?: string; photoURL?: string } = {};
  if (hasName) authUpdate.displayName = data.name!.trim();
  if (hasAvatar) authUpdate.photoURL = data.avatarUrl!.trim();

  await adminAuth.updateUser(uid, authUpdate);

  const dbUpdate: Record<string, any> = { updatedAt: new Date() };
  if (hasName) dbUpdate.name = data.name!.trim();
  if (hasAvatar) dbUpdate.avatarUrl = data.avatarUrl!.trim();

  await adminDb.collection("users").doc(uid).set(dbUpdate, { merge: true });

  return {
    uid,
    name: dbUpdate.name ?? decoded.name,
    avatarUrl: dbUpdate.avatarUrl ?? null,
    updatedAt: dbUpdate.updatedAt,
  };
}

export const updatePassword = async (passwordData: PasswordUpdate) => {
  const decoded = await getUserFromSession();

  if (
    !passwordData?.newPassword ||
    typeof passwordData.newPassword !== "string"
  ) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      data: { field: "newPassword", reason: "empty" },
    });
  }

  if (passwordData.newPassword.length < 8) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      data: { field: "newPassword", reason: "too_short" },
    });
  }

  await adminAuth.updateUser(decoded.uid, {
    password: passwordData.newPassword,
  });

  await adminDb
    .collection("users")
    .doc(decoded.uid)
    .set({ updatedAt: new Date() }, { merge: true });

  // refresh session and validate result inside service
  const loginResult = await loginUser({
    email: decoded.email,
    password: passwordData.newPassword,
  });

  if (!loginResult || !loginResult.sessionCookie) {
    throw createAppError({
      code: "INTERNAL_ERROR",
      message: "Could not refresh session after password update.",
    });
  }

  return loginResult;
};
