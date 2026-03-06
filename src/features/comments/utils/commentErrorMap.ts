import { ValidationStatus } from "@/features/shared/types/validation.type";
import { getErrorEntry } from "@/i18n/errorCatalog";

export function parseCommentErrorMessages(errorCode: string):
  | {
      type: ValidationStatus;
      text: string;
      field: "content" | "root";
    }
  | undefined {
  if (!errorCode) return;

  const entry = getErrorEntry(errorCode);
  const type = entry.validationType ?? "Dismiss";
  const field =
    (entry.field as "content" | "root" | undefined) ?? "root";

  if (field === "content" || field === "root") {
    return {
      type,
      text: entry.message.pl,
      field,
    };
  }

  return {
    type,
    text: entry.message.pl,
    field: "root",
  };
}

