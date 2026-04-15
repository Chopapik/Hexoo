import { getErrorEntry } from "@/i18n/errorCatalog";

export function parseReportCommentError(errorCode: string | undefined): string {
  if (!errorCode) return "";
  return getErrorEntry(errorCode).message.pl;
}
