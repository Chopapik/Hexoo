import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { UserError } from "@/features/users/api/errors/UserError";
import { UserProfileUpdate } from "@/features/users/types/user.type";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import { PasswordUpdate } from "../me.type";
import { loginUser } from "@/features/auth/api/authService";

const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000;

function createCriticalError() {
  return new UserError("Nie udało się wykonać operacji — spróbuj ponownie.", {
    code: 500,
    type: "critical",
  });
}

export async function deleteAccount(): Promise<{ ok: true } | never> {
  try {
    const decoded = await getUserFromSession();

    await adminDb.collection("users").doc(decoded.uid).delete();
    await adminAuth.deleteUser(decoded.uid);

    const cookieStore = await cookies();
    cookieStore.delete("session");

    return { ok: true };
  } catch (error) {
    console.error("Błąd krytyczny przy deleteCurrentUser:", error);
    throw createCriticalError();
  }
}

export async function updateProfile(data: UserProfileUpdate) {
  try {
    const decoded = await getUserFromSession();

    const uid = decoded.uid;

    const authUpdate: { displayName?: string; photoURL?: string } = {};
    if (typeof data.name === "string" && data.name.trim() !== "") {
      authUpdate.displayName = data.name.trim();
    }
    if (typeof data.avatarUrl === "string" && data.avatarUrl.trim() !== "") {
      authUpdate.photoURL = data.avatarUrl.trim();
    }

    await adminAuth.updateUser(uid, authUpdate);

    const dbUpdate: Record<string, any> = {
      name: data.name.trim(),
      updatedAt: new Date(),
    };
    if (data.avatarUrl) dbUpdate.avatarUrl = data.avatarUrl.trim();

    const userRef = adminDb.collection("users").doc(uid);
    await userRef.set(dbUpdate, { merge: true });

    return data;
  } catch (error) {
    console.error("Błąd krytyczny przy updateProfile:", error);
    throw createCriticalError();
  }
}
export const updatePassword = async (passwordData: PasswordUpdate) => {
  try {
    const decoded = await getUserFromSession();

    await adminAuth.updateUser(decoded.uid, {
      password: passwordData.newPassword,
    });
    const dbUpdate: Record<string, any> = {
      updatedAt: new Date(),
    };
    const userRef = adminDb.collection("users").doc(decoded.uid);
    await userRef.set(dbUpdate, { merge: true });

    return await loginUser({
      email: decoded.email,
      password: passwordData.newPassword,
    });
  } catch (error) {
    console.error("Bład podczas wkonywania me:updatePassword: ", error);
    throw error;
  }
};
