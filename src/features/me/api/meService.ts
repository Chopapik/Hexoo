import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { UpdateProfileData, UpdateProfileSchema } from "../me.type";
import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { uploadImage, deleteImage } from "@/features/images/api/imageService";
import { enforceStrictModeration } from "@/features/moderation/utils/assessSafety";
import { logActivity } from "@/features/admin/api/services/activityService";

export async function deleteAccount() {
  const decoded = await getUserFromSession();

  await logActivity(
    decoded.uid,
    "USER_DELETED",
    "User deleted their own account"
  );

  await adminDb.collection("users").doc(decoded.uid).delete();
  await adminAuth.deleteUser(decoded.uid);
  return;
}

export async function updateProfile(data: UpdateProfileData) {
  const decoded = await getUserFromSession();
  const uid = decoded.uid;

  const parsed = UpdateProfileSchema.safeParse(data);
  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[meService.updateProfile] Błąd walidacji danych profilu.",
      data: { details: formatZodErrorFlat(parsed.error) },
    });
  }

  const { name, avatarFile } = parsed.data;

  if (!name && !avatarFile) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[meService.updateProfile] Brak danych do aktualizacji.",
      details: { field: "root", reason: "no_update_fields" },
    });
  }

  await enforceStrictModeration(
    uid,
    name,
    avatarFile,
    "meService.updateProfile"
  );

  const userDoc = await adminDb.collection("users").doc(uid).get();
  const userData = userDoc.data();
  const currentStoragePath = userData?.avatarMeta?.storagePath;

  const authUpdate: { displayName?: string; photoURL?: string } = {};
  const dbUpdate: Record<string, any> = { updatedAt: new Date() };

  if (name) {
    authUpdate.displayName = name;
    dbUpdate.name = name;
  }

  if (avatarFile) {
    const uploadResult = await uploadImage(avatarFile, uid, "avatars");

    if (currentStoragePath) {
      await deleteImage(currentStoragePath);
    }

    authUpdate.photoURL = uploadResult.publicUrl;
    dbUpdate.avatarUrl = uploadResult.publicUrl;
    dbUpdate.avatarMeta = {
      storagePath: uploadResult.storagePath,
      contentType: uploadResult.contentType,
      sizeBytes: uploadResult.sizeBytes,
    };
  }

  if (Object.keys(authUpdate).length > 0) {
    await adminAuth.updateUser(uid, authUpdate);
  }

  await adminDb.collection("users").doc(uid).set(dbUpdate, { merge: true });

  await logActivity(
    uid,
    "PROFILE_UPDATED",
    `Profile updated: ${name ? "name" : ""}${name && avatarFile ? ", " : ""}${avatarFile ? "avatar" : ""}`
  );

  return {
    uid,
    email: decoded.email,
    role: decoded.role,
    name: dbUpdate.name ?? decoded.name,
    avatarUrl: dbUpdate.avatarUrl ?? decoded.avatarUrl,
    isRestricted: decoded.isRestricted,
    isBanned: decoded.isBanned,
  };
}

export const updatePassword = async (passwordData: any) => {
  const decoded = await getUserFromSession();
  const { UpdatePasswordSchema } = await import("../me.type");
  const parsed = UpdatePasswordSchema.safeParse(passwordData);

  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[meService.updatePassword] Błąd walidacji hasła.",
      data: { details: formatZodErrorFlat(parsed.error) },
    });
  }

  const { newPassword } = parsed.data;

  await adminAuth.updateUser(decoded.uid, {
    password: newPassword,
  });

  await adminDb
    .collection("users")
    .doc(decoded.uid)
    .set({ updatedAt: new Date() }, { merge: true });

  await logActivity(decoded.uid, "PASSWORD_CHANGED", "User changed password");
};
