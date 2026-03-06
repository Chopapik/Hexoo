import { ValidationStatus } from "@/features/shared/types/validation.type";
import { getErrorEntry } from "@/i18n/errorCatalog";

export function parseErrorMessages(errorCode: string):
  | {
      type: ValidationStatus;
      text: string;
      field: "text" | "imageFile" | "root";
    }
  | undefined {
  if (!errorCode) return;

  const entry = getErrorEntry(errorCode);
  const type = entry.validationType ?? "Dismiss";
  const field =
    (entry.field as "text" | "imageFile" | "root" | undefined) ?? "root";

  if (field === "text" || field === "imageFile" || field === "root") {
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

