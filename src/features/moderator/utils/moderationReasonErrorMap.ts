import { getErrorEntry, type Lang } from "@/i18n/errorCatalog";

export function parseModerationReasonError(
  errorCode: string | undefined,
  lang: Lang = "pl",
): string {
  if (!errorCode) return "";
  return getErrorEntry(errorCode).message[lang];
}
