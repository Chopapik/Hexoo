import { ValidationMessage } from "@/features/shared/types/validation.type";
import { parseUserNameErrorMessages } from "@/features/shared/utils/userNameErrorMap";
import { getErrorEntry } from "@/i18n/errorCatalog";

export function parseRegisterErrorMessages(
  errorCode: string | undefined,
): ValidationMessage[] | [] {
  if (!errorCode) return [];

  // First, check if it's a user name error
  const userNameError = parseUserNameErrorMessages(errorCode);
  if (userNameError.length > 0) {
    return userNameError;
  }

  // Fallback to catalog for all other errors (email, password, terms, etc.)
  const entry = getErrorEntry(errorCode);

  return [
    {
      type: entry.validationType ?? "Dismiss",
      text: entry.message.pl,
      field: entry.field,
    },
  ];
}

