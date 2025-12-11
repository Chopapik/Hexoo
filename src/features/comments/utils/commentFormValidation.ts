import {
  ValidationMessage,
  ValidationStatus,
} from "@/features/shared/types/validation.type";

const ERROR_DICTIONARY: Record<
  string,
  {
    type: ValidationStatus;
    text: string;
    field: "content" | "root";
  }
> = {
  comment_empty: {
    type: "Dismiss",
    text: "Komentarz nie może być pusty.",
    field: "content",
  },
  comment_too_long: {
    type: "Dismiss",
    text: `Komentarz jest za długi (maks. 500 znaków).`,
    field: "content",
  },
  post_id_required: {
    type: "Dismiss",
    text: "Wystąpił błąd: brak identyfikatora posta.",
    field: "root",
  },
  NOT_FOUND: {
    type: "Dismiss",
    text: "Post, który próbujesz skomentować, już nie istnieje.",
    field: "root",
  },
  AUTH_REQUIRED: {
    type: "Dismiss",
    text: "Wymagane logowanie.",
    field: "root",
  },
  FORBIDDEN: {
    type: "Dismiss",
    text: "Twoje konto ma zablokowaną możliwość komentowania.",
    field: "root",
  },
};

export function parseCommentErrorMessages(errorCode: string):
  | {
      type: ValidationStatus;
      text: string;
      field: "content" | "root";
    }
  | undefined {
  if (errorCode) {
    return ERROR_DICTIONARY[errorCode] || ERROR_DICTIONARY.default;
  }
}
