import { ValidationMessage } from "@/features/shared/types/validation.type";

export const USER_NAME_ERROR_DICTIONARY: Record<string, ValidationMessage> = {
  // Zod validation errors
  name_too_short: {
    text: "Nazwa jest za krótka (min. 3 znaki)",
    field: "name",
    type: "Dismiss",
  },
  name_too_long: {
    text: "Nazwa jest za długa (max. 30 znaków)",
    field: "name",
    type: "Dismiss",
  },
  name_invalid_chars: {
    text: "Niedozwolone znaki w nazwie. Dozwolone: litery, cyfry i podkreślenia",
    field: "name",
    type: "Dismiss",
  },

  // API errors
  CONFLICT: {
    text: "Ta nazwa użytkownika jest już zajęta",
    field: "name",
    type: "Dismiss",
  },
};

export function parseUserNameErrorMessages(
  errorCode: string | undefined
): ValidationMessage[] | [] {
  if (errorCode) {
    const message = USER_NAME_ERROR_DICTIONARY[errorCode];
    if (message) {
      return [message];
    }
  }
  return [];
}
