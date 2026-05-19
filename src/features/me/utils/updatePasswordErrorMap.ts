import { ValidationMessage } from "@/features/shared/types/validation.type";
import { getErrorEntry, type Lang } from "@/i18n/errorCatalog";

export function parseErrorMessages(
  errorCode: string | undefined,
  lang: Lang = "pl",
): ValidationMessage[] | [] {
  if (!errorCode) return [];

  const entry = getErrorEntry(errorCode);

  return [
    {
      type: entry.validationType ?? "Dismiss",
      text: entry.message[lang],
      field: entry.field ?? "root",
    },
  ];
}
