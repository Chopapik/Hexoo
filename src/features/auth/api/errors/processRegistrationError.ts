import { adminAuth } from "@/lib/firebaseAdmin";
import { FirebaseAuthError } from "firebase-admin/auth";
import { createAppError } from "@/lib/ApiError";
import { FirebaseError } from "firebase/app";

export async function processRegistrationError(
  error: any,
  uid?: string
): Promise<never> {
  if (uid) {
    try {
      await adminAuth.deleteUser(uid);
      console.warn(`Rollback: użytkownik ${uid} został usunięty po błędzie.`);
    } catch (rollbackError) {
      if (rollbackError instanceof FirebaseError) {
        throw createAppError({
          message: rollbackError.message,
        });
      }
    }
  }

  if (error instanceof FirebaseAuthError) {
    if (
      error.code === "auth/email-already-exists" ||
      /already in use/i.test(error.message)
    ) {
      throw createAppError({
        code: "CONFLICT",
        data: {
          code: error.code,
          field: "email",
        },
      });
    }

    throw createAppError({
      code: "VALIDATION_ERROR",
      message: error.message,
      data: {},
      details: { stack: error.stack },
    });
  }

  throw error;
}
