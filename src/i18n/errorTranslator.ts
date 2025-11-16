import { ApiError } from "@/lib/ApiError";

const translations: Record<string, Record<string, string>> = {
  pl: {
    AUTH_REQUIRED: "Musisz się zalogować",
    INVALID_CREDENTIALS: "Nieprawidłowe dane logowania",
    VALIDATION_ERROR: "Błąd walidacji",
    NOT_FOUND: "Nie znaleziono zasobu",
    NETWORK_TIMEOUT: "Przekroczono czas żądania",
    NETWORK_ERROR: "Błąd sieci",
    UNKNOWN_ERROR: "Wystąpił błąd",
  },
  en: {
    AUTH_REQUIRED: "Authentication required",
    INVALID_CREDENTIALS: "Invalid credentials",
    VALIDATION_ERROR: "Validation error",
    NOT_FOUND: "Resource not found",
    NETWORK_TIMEOUT: "Request timed out",
    NETWORK_ERROR: "Network error",
    UNKNOWN_ERROR: "Unknown error",
  },
};

export function translateApiError(err: ApiError, lang = "pl") {
  const code = err.code ?? "UNKNOWN_ERROR";
  return translations[lang]?.[code] ?? err.message ?? "Something went wrong";
}
