import type { ErrorCode } from "@/lib/AppError";
import type { ValidationStatus } from "@/features/shared/types/validation.type";

type Lang = "pl" | "en";

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
  | "post_id_required"
  // reports
  | "report_reason_required"
  | "report_details_too_long"
  // moderation
  | "justification_too_short"
  | "justification_too_long"
  | "moderation_action_invalid"
  | "comment_id_required";

// All error codes that can appear in the app
export type GlobalErrorCode =
  | ErrorCode
  | ClientValidationCode
  | "UNKNOWN_ERROR";

export type ErrorCatalogEntry = {
  message: Record<Lang, string>;
  field?: string;
  validationType?: ValidationStatus;
};

export const ERROR_CATALOG: Record<GlobalErrorCode, ErrorCatalogEntry> = {
  // ===== BACKEND / API (ErrorCode from AppError.ts) =====
  AUTH_REQUIRED: {
    message: {
      pl: "Musisz się zalogować",
      en: "Authentication required",
    },
  },
  INVALID_CREDENTIALS: {
    message: {
      pl: "Nieprawidłowe dane logowania",
      en: "Invalid credentials",
    },
  },
  FORBIDDEN: {
    message: {
      pl: "Brak uprawnień do tej czynności",
      en: "You are not allowed to perform this action",
    },
  },
  NOT_FOUND: {
    message: {
      pl: "Nie znaleziono zasobu",
      en: "Resource not found",
    },
  },
  VALIDATION_ERROR: {
    message: {
      pl: "Błąd walidacji danych",
      en: "Validation error",
    },
  },
  RATE_LIMIT: {
    message: {
      pl: "Za dużo prób. Spróbuj ponownie później.",
      en: "Too many attempts. Please try again later.",
    },
  },
  EXTERNAL_SERVICE: {
    message: {
      pl: "Problem z zewnętrzną usługą",
      en: "External service error",
    },
  },
  DB_ERROR: {
    message: {
      pl: "Błąd bazy danych",
      en: "Database error",
    },
  },
  INTERNAL_ERROR: {
    message: {
      pl: "Wystąpił błąd po naszej stronie",
      en: "An internal error occurred",
    },
  },
  INVALID_INPUT: {
    message: {
      pl: "Nieprawidłowe dane wejściowe",
      en: "Invalid input data",
    },
  },
  CONFLICT: {
    message: {
      pl: "Konflikt danych",
      en: "Conflict",
    },
  },
  NETWORK_TIMEOUT: {
    message: {
      pl: "Przekroczono czas żądania",
      en: "Request timed out",
    },
  },
  NETWORK_ERROR: {
    message: {
      pl: "Błąd sieci",
      en: "Network error",
    },
  },
  NO_SESSION: {
    message: {
      pl: "Brak aktywnej sesji użytkownika",
      en: "No active user session",
    },
  },
  USER_NOT_FOUND: {
    message: {
      pl: "Użytkownik nie został znaleziony",
      en: "User not found",
    },
  },
  INVALID_SESSION: {
    message: {
      pl: "Twoja sesja wygasła lub jest nieprawidłowa",
      en: "Your session is invalid or expired",
    },
  },
  UNAUTHORIZED_ACTION: {
    message: {
      pl: "Ta operacja nie jest dozwolona",
      en: "This action is not allowed",
    },
  },
  SERVICE_UNAVAILABLE: {
    message: {
      pl: "Usługa jest chwilowo niedostępna",
      en: "Service is temporarily unavailable",
    },
  },
  POLICY_VIOLATION: {
    message: {
      pl: "Treść narusza zasady serwisu",
      en: "Content violates the service policy",
    },
  },
  ACCOUNT_BANNED: {
    message: {
      pl: "Twoje konto zostało zablokowane",
      en: "Your account has been banned",
    },
  },
  SECURITY_LOCKOUT: {
    message: {
      pl: "Konto tymczasowo zablokowane z powodów bezpieczeństwa",
      en: "Account temporarily locked for security reasons",
    },
  },

  // ===== CLIENT / ZOD validation =====

  // auth / login / register
  email_required: {
    message: {
      pl: "Email jest wymagany",
      en: "Email is required",
    },
    field: "email",
    validationType: "Dismiss",
  },
  email_invalid: {
    message: {
      pl: "Nieprawidłowy format email",
      en: "Invalid email format",
    },
    field: "email",
    validationType: "Dismiss",
  },
  password_required: {
    message: {
      pl: "Hasło jest wymagane",
      en: "Password is required",
    },
    field: "password",
    validationType: "Dismiss",
  },
  password_too_short: {
    message: {
      pl: "Hasło musi mieć min. 8 znaków",
      en: "Password must be at least 8 characters",
    },
    field: "password",
    validationType: "Dismiss",
  },
  password_too_long: {
    message: {
      pl: "Hasło jest za długie",
      en: "Password is too long",
    },
    field: "password",
    validationType: "Dismiss",
  },
  password_missing_uppercase: {
    message: {
      pl: "Hasło musi zawierać wielką literę",
      en: "Password must contain an uppercase letter",
    },
    field: "password",
    validationType: "Warning",
  },
  password_missing_digit: {
    message: {
      pl: "Hasło musi zawierać cyfrę",
      en: "Password must contain a digit",
    },
    field: "password",
    validationType: "Warning",
  },
  password_missing_special: {
    message: {
      pl: "Hasło musi zawierać znak specjalny",
      en: "Password must contain a special character",
    },
    field: "password",
    validationType: "Warning",
  },
  terms_required: {
    message: {
      pl: "Musisz zaakceptować regulamin",
      en: "You must accept the terms",
    },
    field: "terms",
    validationType: "Dismiss",
  },

  // change password
  newPassword_too_short: {
    message: {
      pl: "Nowe hasło musi mieć min. 8 znaków",
      en: "New password must be at least 8 characters",
    },
    field: "newPassword",
    validationType: "Dismiss",
  },
  newPassword_too_long: {
    message: {
      pl: "Nowe hasło jest za długie",
      en: "New password is too long",
    },
    field: "newPassword",
    validationType: "Dismiss",
  },
  reNewPassword_required: {
    message: {
      pl: "Potwierdzenie hasła jest wymagane",
      en: "Password confirmation is required",
    },
    field: "reNewPassword",
    validationType: "Dismiss",
  },
  oldPassword_required: {
    message: {
      pl: "Aktualne hasło jest wymagane",
      en: "Current password is required",
    },
    field: "oldPassword",
    validationType: "Dismiss",
  },
  new_password_not_equal: {
    message: {
      pl: "Nowe hasła nie są identyczne",
      en: "New passwords do not match",
    },
    field: "reNewPassword",
    validationType: "Dismiss",
  },

  // profile / username / avatar
  name_too_short: {
    message: {
      pl: "Nazwa jest za krótka (min. 3 znaki)",
      en: "Name is too short (min. 3 characters)",
    },
    field: "name",
    validationType: "Dismiss",
  },
  name_too_long: {
    message: {
      pl: "Nazwa jest za długa (max. 30 znaków)",
      en: "Name is too long (max. 30 characters)",
    },
    field: "name",
    validationType: "Dismiss",
  },
  name_invalid_chars: {
    message: {
      pl: "Niedozwolone znaki w nazwie",
      en: "Invalid characters in name",
    },
    field: "name",
    validationType: "Dismiss",
  },
  file_too_big: {
    message: {
      pl: "Plik ma zbyt duży rozmiar (maks. 5 MB)",
      en: "File is too large (max 5 MB)",
    },
    field: "imageFile",
    validationType: "Dismiss",
  },
  wrong_file_type: {
    message: {
      pl: "Niedozwolony format pliku",
      en: "Unsupported file type",
    },
    field: "imageFile",
    validationType: "Dismiss",
  },

  // posts
  text_too_long: {
    message: {
      pl: "Treść jest zbyt długa",
      en: "Content is too long",
    },
    field: "text",
    validationType: "Dismiss",
  },
  post_empty: {
    message: {
      pl: "Post nie może być pusty. Dodaj tekst lub zdjęcie.",
      en: "Post cannot be empty. Add text or an image.",
    },
    field: "text",
    validationType: "Dismiss",
  },

  // comments
  comment_empty: {
    message: {
      pl: "Komentarz nie może być pusty.",
      en: "Comment cannot be empty.",
    },
    field: "content",
    validationType: "Dismiss",
  },
  comment_too_long: {
    message: {
      pl: "Komentarz jest za długi (maks. 500 znaków).",
      en: "Comment is too long (max 500 characters).",
    },
    field: "content",
    validationType: "Dismiss",
  },
  post_id_required: {
    message: {
      pl: "Brak identyfikatora posta.",
      en: "Post ID is required.",
    },
    field: "root",
    validationType: "Dismiss",
  },

  // reports
  report_reason_required: {
    message: {
      pl: "Wybierz powód zgłoszenia",
      en: "Select a report reason",
    },
    field: "reason",
    validationType: "Dismiss",
  },
  report_details_too_long: {
    message: {
      pl: "Opis zgłoszenia jest za długi (maks. 300 znaków).",
      en: "Report details are too long (max 300 characters).",
    },
    field: "details",
    validationType: "Dismiss",
  },

  // moderation
  justification_too_short: {
    message: {
      pl: "Uzasadnienie jest za krótkie (min. 5 znaków).",
      en: "Justification is too short (min. 5 characters).",
    },
    field: "justification",
    validationType: "Dismiss",
  },
  justification_too_long: {
    message: {
      pl: "Uzasadnienie jest za długie (maks. 500 znaków).",
      en: "Justification is too long (max 500 characters).",
    },
    field: "justification",
    validationType: "Dismiss",
  },
  moderation_action_invalid: {
    message: {
      pl: "Nieprawidłowa akcja moderacyjna.",
      en: "Invalid moderation action.",
    },
    field: "action",
    validationType: "Dismiss",
  },
  comment_id_required: {
    message: {
      pl: "Brak identyfikatora komentarza.",
      en: "Comment ID is required.",
    },
    field: "root",
    validationType: "Dismiss",
  },

  // Fallback
  UNKNOWN_ERROR: {
    message: {
      pl: "Wystąpił nieznany błąd",
      en: "An unknown error occurred",
    },
  },
};

export function translateError(err: unknown, lang: Lang = "pl"): string {
  const code =
    typeof err === "string"
      ? err
      : err !== null && typeof err === "object" && "code" in err
        ? (err as { code: string }).code
        : undefined;

  if (!code) {
    return ERROR_CATALOG.UNKNOWN_ERROR.message[lang];
  }

  const entry =
    ERROR_CATALOG[code as GlobalErrorCode] ?? ERROR_CATALOG.UNKNOWN_ERROR;

  return entry.message[lang];
}

export function getErrorEntry(code: string | undefined): ErrorCatalogEntry {
  if (!code) {
    return ERROR_CATALOG.UNKNOWN_ERROR;
  }
  return ERROR_CATALOG[code as GlobalErrorCode] ?? ERROR_CATALOG.UNKNOWN_ERROR;
}
