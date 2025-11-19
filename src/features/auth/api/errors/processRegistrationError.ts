import { adminAuth } from "@/lib/firebaseAdmin";
import { FirebaseAuthError } from "firebase-admin/auth";
import formatRegistrationError from "./formatRegistrationError";
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
    const errorFormatted = formatRegistrationError(error);
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: error.message,
      data: {
        field: errorFormatted.field,
        reason: errorFormatted.reason,
      },
      details: {
        stack: error.stack,
        message: error.message,
        code: error.code,
        cause: error.cause,
      },
    });
  }

  throw error;
  // if (error instanceof FirebaseAuthError) {
  //   const data = formatRegistrationError(error);
  //   throw new AuthError(data.message ?? "Błąd walidacji", {
  //     code: 400,
  //     type: "validation",
  //     data,
  //   });
  // }

  // console.error("Błąd rejestracji użytkownika:", error);
  // throw new AuthError("Wystąpił błąd serwera", {
  //   code: 500,
  //   type: "critical",
  // });
}
