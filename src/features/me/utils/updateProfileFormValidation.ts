import { ValidationMessage } from "@/features/shared/types/validation.type";
import {
  parseUserNameErrorMessages,
} from "@/features/shared/utils/userNameValidation";
import {
  parseAvatarFileErrorMessages,
} from "./avatarFileValidation";

const ERROR_DICTIONARY: Record<string, ValidationMessage> = {
  // API errors
  POLICY_VIOLATION: {
    text: "Nazwa lub zdjęcie narusza zasady serwisu",
    field: "root",
    type: "Warning",
  },
  VALIDATION_ERROR: {
    text: "Błąd walidacji danych",
    field: "root",
    type: "Dismiss",
  },
  FORBIDDEN: {
    text: "Brak uprawnień do tej czynności",
    field: "root",
    type: "Dismiss",
  },

  // Default
  default: {
    text: "Wystąpił błąd podczas aktualizacji profilu",
    field: "root",
    type: "Dismiss",
  },
};

export function parseUpdateProfileErrorMessages(
  errorCode: string | undefined
): ValidationMessage[] | [] {
  if (errorCode) {
    // Check if it's a user name error
    const userNameError = parseUserNameErrorMessages(errorCode);
    if (userNameError.length > 0) {
      return userNameError;
    }

    // Check if it's an avatar file error
    const avatarFileError = parseAvatarFileErrorMessages(errorCode);
    if (avatarFileError.length > 0) {
      return avatarFileError;
    }

    // Check other errors
    const message = ERROR_DICTIONARY[errorCode] || ERROR_DICTIONARY.default;
    return [message];
  }
  return [];
}
