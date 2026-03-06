import type { ErrorCode } from "@/lib/AppError";
import type { ValidationStatus } from "@/features/shared/types/validation.type";

type Lang = "pl" | "en";
type ErrorSource = "api" | "client";

// Codes produced on the client side (Zod / hooks / forms)
export type ClientValidationCode =
  // auth / login / register
  | "email_required"
  | "email_invalid"
  | "password_required"
  | "password_too_short"
  | "password_too_long"
  | "password_missing_uppercase"
  | "password_missing_digit"
  | "password_missing_special"
  | "terms_required"
  // profile / username / avatar
  | "name_too_short"
  | "name_too_long"
  | "name_invalid_chars"
  | "file_too_big"
  | "wrong_file_type"
  // change password
  | "newPassword_too_short"
  | "newPassword_too_long"
  | "reNewPassword_required"
  | "oldPassword_required"
  | "new_password_not_equal"
  // posts
  | "text_too_long"
  | "post_empty"
  // comments
  | "comment_empty"
  | "comment_too_long"
  | "post_id_required";

// All error codes that can appear in the app
export type GlobalErrorCode =
  | ErrorCode
  | ClientValidationCode
  | "UNKNOWN_ERROR";

export type ErrorCatalogEntry = {
  source: ErrorSource;
  message: Record<Lang, string>;
  field?: string;
  validationType?: ValidationStatus;
};

export const ERROR_CATALOG: Record<GlobalErrorCode, ErrorCatalogEntry> = {
  // ===== BACKEND / API (ErrorCode from AppError.ts) =====
  AUTH_REQUIRED: {
    source: "api",
    message: {
      pl: "Musisz się zalogować",
      en: "Authentication required",
    },
  },
  INVALID_CREDENTIALS: {
    source: "api",
    message: {
      pl: "Nieprawidłowe dane logowania",
      en: "Invalid credentials",
    },
  },
  FORBIDDEN: {
    source: "api",
    message: {
      pl: "Brak uprawnień do tej czynności",
      en: "You are not allowed to perform this action",
    },
  },
  NOT_FOUND: {
    source: "api",
    message: {
      pl: "Nie znaleziono zasobu",
      en: "Resource not found",
    },
  },
  VALIDATION_ERROR: {
    source: "api",
    message: {
      pl: "Błąd walidacji danych",
      en: "Validation error",
    },
  },
  RATE_LIMIT: {
    source: "api",
    message: {
      pl: "Za dużo prób. Spróbuj ponownie później.",
      en: "Too many attempts. Please try again later.",
    },
  },
  EXTERNAL_SERVICE: {
    source: "api",
    message: {
      pl: "Problem z zewnętrzną usługą",
      en: "External service error",
    },
  },
  DB_ERROR: {
    source: "api",
    message: {
      pl: "Błąd bazy danych",
      en: "Database error",
    },
  },
  INTERNAL_ERROR: {
    source: "api",
    message: {
      pl: "Wystąpił błąd po naszej stronie",
      en: "An internal error occurred",
    },
  },
  INVALID_INPUT: {
    source: "api",
    message: {
      pl: "Nieprawidłowe dane wejściowe",
      en: "Invalid input data",
    },
  },
  CONFLICT: {
    source: "api",
    message: {
      pl: "Konflikt danych",
      en: "Conflict",
    },
  },
  NETWORK_TIMEOUT: {
    source: "api",
    message: {
      pl: "Przekroczono czas żądania",
      en: "Request timed out",
    },
  },
  NETWORK_ERROR: {
    source: "api",
    message: {
      pl: "Błąd sieci",
      en: "Network error",
    },
  },
  NO_SESSION: {
    source: "api",
    message: {
      pl: "Brak aktywnej sesji użytkownika",
      en: "No active user session",
    },
  },
  USER_NOT_FOUND: {
    source: "api",
    message: {
      pl: "Użytkownik nie został znaleziony",
      en: "User not found",
    },
  },
  INVALID_SESSION: {
    source: "api",
    message: {
      pl: "Twoja sesja wygasła lub jest nieprawidłowa",
      en: "Your session is invalid or expired",
    },
  },
  UNAUTHORIZED_ACTION: {
    source: "api",
    message: {
      pl: "Ta operacja nie jest dozwolona",
      en: "This action is not allowed",
    },
  },
  SERVICE_UNAVAILABLE: {
    source: "api",
    message: {
      pl: "Usługa jest chwilowo niedostępna",
      en: "Service is temporarily unavailable",
    },
  },
  POLICY_VIOLATION: {
    source: "api",
    message: {
      pl: "Treść narusza zasady serwisu",
      en: "Content violates the service policy",
    },
  },
  ACCOUNT_BANNED: {
    source: "api",
    message: {
      pl: "Twoje konto zostało zablokowane",
      en: "Your account has been banned",
    },
  },
  SECURITY_LOCKOUT: {
    source: "api",
    message: {
      pl: "Konto tymczasowo zablokowane z powodów bezpieczeństwa",
      en: "Account temporarily locked for security reasons",
    },
  },

  // ===== CLIENT / ZOD validation =====

  // auth / login / register
  email_required: {
    source: "client",
    message: {
      pl: "Email jest wymagany",
      en: "Email is required",
    },
    field: "email",
    validationType: "Dismiss",
  },
  email_invalid: {
    source: "client",
    message: {
      pl: "Nieprawidłowy format email",
      en: "Invalid email format",
    },
    field: "email",
    validationType: "Dismiss",
  },
  password_required: {
    source: "client",
    message: {
      pl: "Hasło jest wymagane",
      en: "Password is required",
    },
    field: "password",
    validationType: "Dismiss",
  },
  password_too_short: {
    source: "client",
    message: {
      pl: "Hasło musi mieć min. 8 znaków",
      en: "Password must be at least 8 characters",
    },
    field: "password",
    validationType: "Dismiss",
  },
  password_too_long: {
    source: "client",
    message: {
      pl: "Hasło jest za długie",
      en: "Password is too long",
    },
    field: "password",
    validationType: "Dismiss",
  },
  password_missing_uppercase: {
    source: "client",
    message: {
      pl: "Hasło musi zawierać wielką literę",
      en: "Password must contain an uppercase letter",
    },
    field: "password",
    validationType: "Warning",
  },
  password_missing_digit: {
    source: "client",
    message: {
      pl: "Hasło musi zawierać cyfrę",
      en: "Password must contain a digit",
    },
    field: "password",
    validationType: "Warning",
  },
  password_missing_special: {
    source: "client",
    message: {
      pl: "Hasło musi zawierać znak specjalny",
      en: "Password must contain a special character",
    },
    field: "password",
    validationType: "Warning",
  },
  terms_required: {
    source: "client",
    message: {
      pl: "Musisz zaakceptować regulamin",
      en: "You must accept the terms",
    },
    field: "terms",
    validationType: "Dismiss",
  },

  // profile / username / avatar
  name_too_short: {
    source: "client",
    message: {
      pl: "Nazwa jest za krótka (min. 3 znaki)",
      en: "Name is too short (min. 3 characters)",
    },
    field: "name",
    validationType: "Dismiss",
  },
  name_too_long: {
    source: "client",
    message: {
      pl: "Nazwa jest za długa (max. 30 znaków)",
      en: "Name is too long (max. 30 characters)",
    },
    field: "name",
    validationType: "Dismiss",
  },
  name_invalid_chars: {
    source: "client",
    message: {
      pl: "Niedozwolone znaki w nazwie",
      en: "Invalid characters in name",
    },
    field: "name",
    validationType: "Dismiss",
  },
  file_too_big: {
    source: "client",
    message: {
      pl: "Plik ma zbyt duży rozmiar (maks. 5 MB)",
      en: "File is too large (max 5 MB)",
    },
    field: "imageFile",
    validationType: "Dismiss",
  },
  wrong_file_type: {
    source: "client",
    message: {
      pl: "Niedozwolony format pliku",
      en: "Unsupported file type",
    },
    field: "imageFile",
    validationType: "Dismiss",
  },

  // posts
  text_too_long: {
    source: "client",
    message: {
      pl: "Treść jest zbyt długa",
      en: "Content is too long",
    },
    field: "text",
    validationType: "Dismiss",
  },
  post_empty: {
    source: "client",
    message: {
      pl: "Post nie może być pusty. Dodaj tekst lub zdjęcie.",
      en: "Post cannot be empty. Add text or an image.",
    },
    field: "text",
    validationType: "Dismiss",
  },

  // comments
  comment_empty: {
    source: "client",
    message: {
      pl: "Komentarz nie może być pusty.",
      en: "Comment cannot be empty.",
    },
    field: "content",
    validationType: "Dismiss",
  },
  comment_too_long: {
    source: "client",
    message: {
      pl: "Komentarz jest za długi (maks. 500 znaków).",
      en: "Comment is too long (max 500 characters).",
    },
    field: "content",
    validationType: "Dismiss",
  },
  post_id_required: {
    source: "client",
    message: {
      pl: "Brak identyfikatora posta.",
      en: "Post ID is required.",
    },
    field: "root",
    validationType: "Dismiss",
  },

  // Fallback
  UNKNOWN_ERROR: {
    source: "api",
    message: {
      pl: "Wystąpił nieznany błąd",
      en: "An unknown error occurred",
    },
  },
};

export function translateError(err: unknown, lang: Lang = "pl"): string {
  const code =
    typeof err === "string" ? err : (err as any)?.code ?? undefined;

  if (!code) {
    return ERROR_CATALOG.UNKNOWN_ERROR.message[lang];
  }

  const entry =
    ERROR_CATALOG[code as GlobalErrorCode] ??
    ERROR_CATALOG.UNKNOWN_ERROR;

  return entry.message[lang];
}

export function getErrorEntry(
  code: string | undefined,
): ErrorCatalogEntry {
  if (!code) {
    return ERROR_CATALOG.UNKNOWN_ERROR;
  }
  return (
    ERROR_CATALOG[code as GlobalErrorCode] ??
    ERROR_CATALOG.UNKNOWN_ERROR
  );
}

