import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import {
  UpdatePasswordData,
  UpdatePasswordSchema,
  UpdateProfileData,
  UpdateProfileSchema,
} from "../me.type";
import { createAppError } from "@/lib/ApiError";
import { formatZodErrorFlat } from "@/lib/zod";

export async function deleteAccount() {
  const decoded = await getUserFromSession();
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

  if (!name && avatarFile === undefined) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[meService.updateProfile] Brak danych do aktualizacji.",
      details: { field: "root", reason: "no_update_fields" },
    });
  }

  const authUpdate: { displayName?: string; photoURL?: string } = {};
  const dbUpdate: Record<string, any> = { updatedAt: new Date() };

  if (name) {
    authUpdate.displayName = name;
    dbUpdate.name = name;
  }

  if (avatarFile !== undefined) {
    authUpdate.photoURL = "";
    dbUpdate.avatarUrl = null; //TODO add saving images from imageservice
  }

  if (Object.keys(authUpdate).length > 0) {
    await adminAuth.updateUser(uid, authUpdate);
  }

  await adminDb.collection("users").doc(uid).set(dbUpdate, { merge: true });

  return {
    uid,
    name: dbUpdate.name ?? decoded.name,
    avatarUrl: dbUpdate.avatarUrl ?? null,
    updatedAt: dbUpdate.updatedAt,
  };
}

export const updatePassword = async (passwordData: UpdatePasswordData) => {
  const decoded = await getUserFromSession();

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
};
