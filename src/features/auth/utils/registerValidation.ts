import type { ValidationMessage } from "@/features/shared/types/validation.type";

export interface FieldErrors {
  name: ValidationMessage[];
  email: ValidationMessage[];
  password: ValidationMessage[];
  root?: string;
}

type FieldName = "name" | "email" | "password";

const NAME_MIN = 3;
const NAME_MAX = 30;
const EMAIL_MAX = 254;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

export const checkPasswordQuality = (value: string): ValidationMessage[] => {
  const msgs: ValidationMessage[] = [];

  if (value.length < PASSWORD_MIN) {
    msgs.push({
      type: "Dismiss",
      text: `Hasło musi mieć co najmniej ${PASSWORD_MIN} znaków`,
    });
  }

  if (value.length > PASSWORD_MAX) {
    msgs.push({
      type: "Dismiss",
      text: `Hasło nie może przekraczać ${PASSWORD_MAX} znaków`,
    });
  }

  if (/\s/.test(value)) {
    msgs.push({
      type: "Dismiss",
      text: "Hasło nie może zawierać spacji ani innych białych znaków",
    });
  }

  if (!/[a-z]/.test(value)) {
    msgs.push({
      type: "Dismiss",
      text: "Hasło musi zawierać przynajmniej jedną małą literę",
    });
  }

  if (!/[A-Z]/.test(value)) {
    msgs.push({
      type: "Warning",
      text: "Hasło musi zawierać przynajmniej jedną wielką literę",
    });
  }

  if (!/[0-9]/.test(value)) {
    msgs.push({
      type: "Warning",
      text: "Hasło musi zawierać przynajmniej jedną cyfrę",
    });
  }

  if (!/[!@#$%^&*(),.?\":{}|<>_\-\\[\];'`~+/=]/.test(value)) {
    msgs.push({
      type: "Warning",
      text: "Hasło musi zawierać przynajmniej jeden znak specjalny",
    });
  }

  return msgs;
};

export const validateField = (
  field: FieldName,
  rawValue: string,
  isSubmit = false
): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];
  const value = rawValue == null ? "" : rawValue.trim();

  switch (field) {
    // ===== NAME =====
    case "name": {
      if (!value) {
        messages.push({ type: "Dismiss", text: "Imię jest wymagane" });
        break;
      }

      if (value.length < NAME_MIN && isSubmit) {
        messages.push({
          type: "Dismiss",
          text: `Imię musi mieć co najmniej ${NAME_MIN} znaki`,
        });
      }

      if (value.length > NAME_MAX) {
        messages.push({
          type: "Dismiss",
          text: `Imię nie może przekraczać ${NAME_MAX} znaków`,
        });
      }

      if (!/^[A-Za-z0-9_-]+$/.test(value)) {
        messages.push({
          type: "Dismiss",
          text: "Imię może zawierać tylko litery, cyfry, myślnik (-) i podkreślenie (_)",
        });
      }

      break;
    }

    // ===== EMAIL =====
    case "email": {
      if (!value) {
        messages.push({ type: "Dismiss", text: "Email jest wymagany" });
        break;
      }

      if (value.length > EMAIL_MAX) {
        messages.push({
          type: "Dismiss",
          text: "Email jest za długi",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (isSubmit && !emailRegex.test(value)) {
        messages.push({
          type: "Dismiss",
          text: "Format adresu email jest nieprawidłowy",
        });
      }

      break;
    }

    // ===== PASSWORD =====
    case "password": {
      if (!rawValue) {
        messages.push({ type: "Dismiss", text: "Hasło jest wymagane" });
        break;
      }

      messages.push(...checkPasswordQuality(rawValue));
      break;
    }
  }

  return messages;
};

export const validateAllFields = (inputs: {
  name: string;
  email: string;
  password: string;
}): Record<FieldName, ValidationMessage[]> => {
  return {
    name: validateField("name", inputs.name, true),
    email: validateField("email", inputs.email, true),
    password: validateField("password", inputs.password, true),
  };
};
