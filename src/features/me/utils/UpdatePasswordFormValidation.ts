import { ValidationMessage } from "@/features/shared/types/validation.type";

const ERROR_DICTIONARY: Record<string, ValidationMessage> = {
  newPassword_too_short: {
    text: "Hasło za krótkie",
    field: "newPassword",
    type: "Dismiss",
  },
  newPassword_too_long: {
    text: "Hasło za długie",
    field: "newPassword",
    type: "Dismiss",
  },
  reNewPassword_required: {
    text: "Powtórzenie hasła jest wymagane",
    field: "password",
    type: "Dismiss",
  },
  oldPassword_required: {
    text: "Stare hasło jest wymagane",
    field: "root",
    type: "Dismiss",
  },
  new_password_not_equal: {
    text: "Nowe hasła nie są takie same",
    field: "newPassword",
    type: "Dismiss",
  },
  "auth/wrong-password": {
    text: "Stare hasło jest niepoprawne",
    field: "oldPassword",
    type: "Dismiss",
  },
  "auth/invalid-credential": {
    text: "Stare hasło jest niepoprawne",
    field: "oldPassword",
    type: "Dismiss",
  },

  FORBIDDEN: {
    text: "Brak uprawnień do tej czynności",
    field: "root",
    type: "Dismiss",
  },
  default: {
    text: "Wystąpił nieznany błąd",
    field: "root",
    type: "Dismiss",
  },
};

export function parseErrorMessages(
  errorCode: string | undefined
): ValidationMessage[] | [] {
  if (errorCode) {
    const message = ERROR_DICTIONARY[errorCode] || ERROR_DICTIONARY.default;
    return [message];
  }
  return [];
}
