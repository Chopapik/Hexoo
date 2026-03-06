import { ValidationMessage } from "@/features/shared/types/validation.type";
import { parseUserNameErrorMessages } from "@/features/shared/utils/userNameErrorMap";
import { parseAvatarFileErrorMessages } from "./avatarFileErrorMap";
import { getErrorEntry } from "@/i18n/errorCatalog";

export function parseUpdateProfileErrorMessages(
  errorCode: string | undefined,
): ValidationMessage[] | [] {
  if (!errorCode) return [];

  // 1. User name–specific errors
  const userNameError = parseUserNameErrorMessages(errorCode);
  if (userNameError.length > 0) {
    return userNameError;
  }

  // 2. Avatar file–specific errors
  const avatarFileError = parseAvatarFileErrorMessages(errorCode);
  if (avatarFileError.length > 0) {
    return avatarFileError;
  }

  // 3. Remaining errors from the central catalog
  const entry = getErrorEntry(errorCode);

  return [
    {
      type: entry.validationType ?? "Dismiss",
      text: entry.message.pl,
      field: entry.field ?? "root",
    },
  ];
}

