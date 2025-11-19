import { FirebaseAuthError } from "firebase-admin/auth";

export default function formatRegistrationError(error: FirebaseAuthError) {
  const errorCode = error.code;
  switch (errorCode) {
    // Email-related
    case "auth/email-already-exists":
    case "auth/email-already-in-use":
      return {
        reason: errorCode,
        field: "email",
      };

    case "auth/invalid-email":
      return {
        reason: errorCode,
        field: "email",
      };

    case "auth/missing-email":
      return {
        reason: errorCode,
        field: "email",
      };

    // Password-related
    case "auth/weak-password":
      return {
        reason: errorCode,
        field: "password",
      };

    case "auth/invalid-password":
      return {
        reason: errorCode,
        field: "password",
      };

    case "auth/missing-password":
      return {
        reason: errorCode,
        field: "password",
      };

    default:
      return {
        field: "root",
      };
  }
}
