import { ValidationMessage } from "@/features/shared/types/validation.type";

const LOGIN_ERROR_MAP: Record<string, ValidationMessage> = {
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
  SECURITY_LOCKOUT: {
    text: "Konto zostało zablokowane tymczasowo z powodu zbyt dużej liczby niepoprawnych logowań",
    field: "root",
    type: "Dismiss",
  },
  ACCOUNT_BANNED: {
    text: "Twoje konto zostało zablokowane za naruszenie regulaminu",
    field: "root",
    type: "Dismiss",
  },
  default: {
    text: "Wystąpił błąd logowania",
    field: "root",
    type: "Dismiss",
  },
};

export function parseErrorMessages(
  errorCode: string | undefined,
): ValidationMessage[] | [] {
  if (errorCode) {
    const message = LOGIN_ERROR_MAP[errorCode] || LOGIN_ERROR_MAP.default;
    return [message];
  }
  return [];
}

