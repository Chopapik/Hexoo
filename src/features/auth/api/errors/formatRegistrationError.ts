import { createAppError, ErrorCode } from "@/lib/ApiError";
import { FirebaseAuthError } from "firebase-admin/auth";

export default function formatRegistrationError(error: FirebaseAuthError) {
  const errorCode = error.code;
  switch (errorCode) {
    // Email-related
    case "auth/email-already-exists":
    case "auth/email-already-in-use":
      return {
        code: errorCode,
        field: "email",
      };

    case "auth/invalid-email":
      return {
        code: errorCode,
        message: "Nieprawidłowy format adresu email",
        field: "email",
      };

    case "auth/missing-email":
      return {
        code: errorCode,
        message: "Email jest wymagany",
        field: "email",
      };

    // Password-related
    case "auth/weak-password":
      return {
        code: errorCode,
        message: "Hasło jest zbyt słabe",
        field: "password",
      };

    case "auth/invalid-password":
      return {
        code: errorCode,
        message: "Nieprawidłowe hasło",
        field: "password",
      };

    case "auth/missing-password":
      return {
        code: errorCode,
        message: "Hasło jest wymagane",
        field: "password",
      };

    default:
      return {
        code: "INTERNAL_ERROR",
        message: "Nieobsłużony błąd FirebaseAuthError",
      };
  }
}
