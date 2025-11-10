import { FirebaseAuthError } from "firebase-admin/auth";

export default function handleRegisterError(error: FirebaseAuthError) {
  const errorCode = error.code;

  switch (errorCode) {
    // Email-related
    case "auth/email-already-exists":
    case "auth/email-already-in-use":
      return {
        message: "Email już zajęty",
        field: "email",
      };

    case "auth/invalid-email":
      return {
        message: "Nieprawidłowy format adresu email",
        field: "email",
      };

    case "auth/missing-email":
      return {
        message: "Email jest wymagany",
        field: "email",
      };

    // Password-related
    case "auth/weak-password":
      return {
        message: "Hasło jest zbyt słabe",
        field: "password",
      };

    case "auth/invalid-password":
      return {
        message: "Nieprawidłowe hasło",
        field: "password",
      };

    case "auth/missing-password":
      return {
        message: "Hasło jest wymagane",
        field: "password",
      };

    case "auth/id-token-expired":
      return {
        message: "Sesja wygasła. Zaloguj się ponownie.",
        field: "token",
      };

    case "auth/id-token-revoked":
      return {
        message: "Sesja została unieważniona. Zaloguj się ponownie.",
        field: "token",
      };

    case "auth/insufficient-permission":
      return {
        message: "Brak uprawnień do wykonania tej operacji",
        field: "general",
      };

    case "auth/claims-too-large":
      return {
        message: "Zbyt duży rozmiar danych użytkownika (claims)",
        field: "general",
      };

    case "auth/internal-error":
      return {
        message: "Błąd wewnętrzny serwera Firebase",
        field: "general",
      };

    case "auth/invalid-argument":
      return {
        message: "Nieprawidłowy argument w żądaniu",
        field: "general",
      };

    case "auth/network-request-failed":
      return {
        message: "Błąd połączenia z serwerem Firebase",
        field: "general",
      };

    default:
      console.error("Nieobsłużony błąd FirebaseAuthError:", error);
      return {
        message: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
        field: "root",
      };
  }
}
