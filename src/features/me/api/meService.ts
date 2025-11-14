import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { UserError } from "@/features/users/api/errors/UserError";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";

function createCriticalError() {
  return new UserError("Nie udało się wykonać operacji — spróbuj ponownie.", {
    code: 500,
    type: "critical",
  });
}

export async function deleteAccount(): Promise<{ ok: true } | never> {
  try {
    const decoded = await getUserFromSession();
    if (!decoded) {
      console.error("Nie udało się uzyskać UID użytkownika");
      throw createCriticalError();
    }

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
