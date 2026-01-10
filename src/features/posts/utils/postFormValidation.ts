import {
  ValidationMessage,
  ValidationStatus,
} from "@/features/shared/types/validation.type";

const ERROR_DICTIONARY: Record<
  string,
  {
    type: ValidationStatus;
    text: string;
    field: "text" | "imageFile" | "root";
  }
> = {
  text_too_long: {
    type: "Dismiss",
    text: "Treść jest zbyt długa.",
    field: "text",
  },

  file_too_big: {
    type: "Dismiss",
    text: "Plik ma zbyt duży rozmiar (maksymalnie 5 MB).",
    field: "imageFile",
  },

  wrong_file_type: {
    type: "Dismiss",
    text: "Niedozwolony format pliku.",
    field: "imageFile",
  },
  post_empty: {
    type: "Dismiss",
    text: "Post nie może być pusty. Dodaj tekst lub zdjęcie.",
    field: "text",
  },
};

export function parseErrorMessages(errorCode: string):
  | {
      type: ValidationStatus;
      text: string;
      field: "text" | "imageFile" | "root";
    }
  | undefined {
  if (errorCode) {
    return ERROR_DICTIONARY[errorCode] || ERROR_DICTIONARY.default;
  }
}
