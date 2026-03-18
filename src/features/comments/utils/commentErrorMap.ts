import { ValidationStatus } from "@/features/shared/types/validation.type";
import { getErrorEntry } from "@/i18n/errorCatalog";

export function parseCommentErrorMessages(errorCode: string):
  | {
      type: ValidationStatus;
      text: string;
      field: "content" | "imageFile" | "root";
    }
  | undefined {
  if (!errorCode) return;

  const entry = getErrorEntry(errorCode);
  const type = entry.validationType ?? "Dismiss";
  const field =
    (entry.field as "content" | "imageFile" | "root" | undefined) ?? "root";

  if (field === "content" || field === "imageFile" || field === "root") {
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

