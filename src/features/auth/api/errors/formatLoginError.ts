export default function formatLoginError(payload: any) {
  const code =
    payload?.code ??
    payload?.data?.code ??
    payload?.message ??
    payload?.error?.message;

  console.log("code", code);

  switch (code) {
    case "INVALID_PASSWORD":
    case "auth/wrong-password":
      return { message: "Nieprawidłowe hasło", field: "password" };

    case "EMAIL_NOT_FOUND":
    case "auth/user-not-found":
      return {
        message: "Użytkownik o podanym emailu nie istnieje",
        field: "email",
      };

    case "USER_DISABLED":
    case "auth/user-disabled":
      return { message: "Konto zablokowane", field: "general" };

    case "INVALID_EMAIL":
    case "auth/invalid-email":
      return { message: "Nieprawidłowy format adresu email", field: "email" };

    case "TOO_MANY_ATTEMPTS_TRY_LATER":
    case "auth/too-many-requests":
      return { message: "Zbyt wiele prób — spróbuj później", field: "general" };

    case "EMAIL_EXISTS":
    case "auth/email-already-exists":
    case "auth/email-already-in-use":
      return {
        message: "Adres email jest już używany przez inne konto",
        field: "email",
      };

    case "auth/operation-not-allowed":
      return {
        message: "Metoda logowania jest wyłączona",
        field: "general",
      };

    case "auth/weak-password":
      return {
        message: "Hasło jest zbyt słabe",
        field: "password",
      };

    case "auth/invalid-credential":
      return {
        message: "Nieprawidłowe dane uwierzytelniające",
        field: "general",
      };

    case "auth/id-token-expired":
    case "auth/id-token-revoked":
      return {
        message: "Sesja wygasła - zaloguj się ponownie",
        field: "general",
      };

    case "auth/app-deleted":
      return {
        message: "Aplikacja Firebase została usunięta",
        field: "general",
      };

    case "auth/app-not-authorized":
      return {
        message: "Aplikacja nie ma uprawnień do Firebase Auth",
        field: "general",
      };

    case "auth/network-request-failed":
      return {
        message: "Błąd połączenia sieciowego",
        field: "general",
      };

    case "auth/network-request-failed":
      return {
        message: "Błąd połączenia sieciowego",
        field: "general",
      };

    case "INVALID_LOGIN_CREDENTIALS":
      return {
        message: "Niepoprawne hasło lub nazwa",
        type: "critical",
      };

    default:
      console.warn("Nieznany kod błędu Firebase:", code);
      return {
        message: "Błąd logowania — spróbuj ponownie",
        field: "general",
      };
  }
}
