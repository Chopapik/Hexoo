import { ValidationMessage } from "@/features/shared/types/validation.type";
import { parseUserNameErrorMessages } from "@/features/shared/utils/userNameValidation";

const ERROR_DICTIONARY: Record<string, ValidationMessage> = {
  //zod
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
  terms_required: { text: "Musisz zaakceptować regulamin", type: "Dismiss" },

  //Firebase client auth SDK
  "auth/email-already-exists": {
    text: "Ten email jest już zajęty",
    type: "Dismiss",
  },

  // Default
  default: { text: "Wystąpił błąd rejestracji", type: "Dismiss" },
};

export function parseRegisterErrorMessages(
  errorCode: string | undefined
): ValidationMessage[] | [] {
  if (errorCode) {
    // Check if it's a user name error
    const userNameError = parseUserNameErrorMessages(errorCode);
    if (userNameError.length > 0) {
      return userNameError;
    }

    // Check other errors
    const message = ERROR_DICTIONARY[errorCode] || {
      ...ERROR_DICTIONARY.default,
      text: errorCode,
    };
    return [message];
  }
  return [];
}
