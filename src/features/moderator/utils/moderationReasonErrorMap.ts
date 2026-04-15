import { getErrorEntry } from "@/i18n/errorCatalog";

export function parseModerationReasonError(
  errorCode: string | undefined,
): string {
  if (!errorCode) return "";
  return getErrorEntry(errorCode).message.pl;
}
