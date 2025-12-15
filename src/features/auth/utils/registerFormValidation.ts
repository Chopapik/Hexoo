import { ValidationMessage } from "@/features/shared/types/validation.type";

const ERROR_DICTIONARY: Record<string, ValidationMessage> = {
  email_required: { text: "Email jest wymagany", type: "Dismiss" },
  email_invalid: { text: "Nieprawidłowy format Email", type: "Dismiss" },
  password_too_short: {
    text: "Hasło musi mieć min. 8 znaków",
    type: "Dismiss",
  },
  password_too_long: { text: "Hasło jest za długie", type: "Dismiss" },
  password_missing_uppercase: {
    text: "Wymagana wielka litera",
    type: "Warning",
  },
  password_missing_digit: { text: "Wymagana cyfra", type: "Warning" },
  password_missing_special: {
    text: "Wymagany znak specjalny",
    type: "Warning",
  },
  name_too_short: { text: "Nazwa jest za krótka", type: "Dismiss" },
  name_too_long: { text: "Nazwa jest za długa", type: "Dismiss" },
  name_invalid_chars: { text: "Niedozwolone znaki w nazwie", type: "Dismiss" },

  "auth/email-already-exists": {
    text: "Ten email jest już zajęty",
    type: "Dismiss",
  },

  // API
  CONFLICT: {
    text: "Ta nazwa użytkownika jest zajęta",
    type: "Dismiss",
  },

  // Default
  default: { text: "Wystąpił błąd rejestracji", type: "Dismiss" },
};

export function parseRegisterErrorMessages(
  errorCode: string | undefined
): ValidationMessage[] | [] {
  if (errorCode) {
    const message = ERROR_DICTIONARY[errorCode] || {
      ...ERROR_DICTIONARY.default,
      text: errorCode,
    };
    return [message];
  }
  return [];
}
