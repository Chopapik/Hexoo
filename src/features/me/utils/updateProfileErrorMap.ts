import { ValidationMessage } from "@/features/shared/types/validation.type";
import { parseUserNameErrorMessages } from "@/features/shared/utils/userNameErrorMap";
import { parseAvatarFileErrorMessages } from "./avatarFileErrorMap";
import { getErrorEntry, type Lang } from "@/i18n/errorCatalog";

export function parseUpdateProfileErrorMessages(
  errorCode: string | undefined,
  lang: Lang = "pl",
): ValidationMessage[] | [] {
  if (!errorCode) return [];

  // 1. User name–specific errors
  const userNameError = parseUserNameErrorMessages(errorCode, lang);
  if (userNameError.length > 0) {
    return userNameError;
  }

  // 2. Avatar file–specific errors
  const avatarFileError = parseAvatarFileErrorMessages(errorCode, lang);
  if (avatarFileError.length > 0) {
    return avatarFileError;
  }

  // 3. Remaining errors from the central catalog
  const entry = getErrorEntry(errorCode);

  return [
    {
      type: entry.validationType ?? "Dismiss",
      text: entry.message[lang],
      field: entry.field ?? "root",
    },
  ];
}
