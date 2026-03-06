import { ValidationMessage } from "@/features/shared/types/validation.type";
import { getErrorEntry } from "@/i18n/errorCatalog";

export function parseAvatarFileErrorMessages(
  errorCode: string | undefined,
): ValidationMessage[] | [] {
  if (!errorCode) return [];

  const entry = getErrorEntry(errorCode);

  return [
    {
      type: entry.validationType ?? "Dismiss",
      text: entry.message.pl,
      field: entry.field ?? "avatarFile",
    },
  ];
}

