import { getErrorEntry } from "@/i18n/errorCatalog";

export function parseReportPostError(errorCode: string | undefined): string {
  if (!errorCode) return "";
  return getErrorEntry(errorCode).message.pl;
}
