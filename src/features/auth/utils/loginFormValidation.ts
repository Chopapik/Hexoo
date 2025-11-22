import { ValidationMessage } from "@/features/shared/types/validation.type";
import { INVALID } from "zod/v3";

const ERROR_DICTIONARY: Record<string, ValidationMessage> = {
  email_required: {
    text: "Email jest wymagany",
    field: "email",
    type: "Dismiss",
  },
  email_invalid: {
    text: "Nieprawidłowy format Email",
    field: "email",
    type: "Dismiss",
  },
  password_required: {
    text: "Hasło jest wymagane",
    field: "password",
    type: "Dismiss",
  },
  INVALID_CREDENTIALS: {
    text: "Niepoprawne dane logowania",
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
