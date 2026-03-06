import { ValidationMessage } from "@/features/shared/types/validation.type";

export const AVATAR_FILE_ERROR_MAP: Record<string, ValidationMessage> = {
  // Zod validation errors
  file_too_big: {
    text: "Plik ma zbyt duży rozmiar (maksymalnie 5 MB)",
    field: "avatarFile",
    type: "Dismiss",
  },
  wrong_file_type: {
    text: "Niedozwolony format pliku. Dozwolone: PNG, JPG, WEBP",
    field: "avatarFile",
    type: "Dismiss",
  },
};

export function parseAvatarFileErrorMessages(
  errorCode: string | undefined,
): ValidationMessage[] | [] {
  if (errorCode) {
    const message = AVATAR_FILE_ERROR_MAP[errorCode];
    if (message) {
      return [message];
    }
  }
  return [];
}

