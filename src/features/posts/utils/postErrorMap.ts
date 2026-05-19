import { ValidationStatus } from "@/features/shared/types/validation.type";
import { getErrorEntry, type Lang } from "@/i18n/errorCatalog";

export function parseErrorMessages(errorCode: string, lang: Lang = "pl"):
  | {
      type: ValidationStatus;
      text: string;
      field: "text" | "imageFile" | "youtubeUrl" | "root";
    }
  | undefined {
  if (!errorCode) return;

  const entry = getErrorEntry(errorCode);
  const type = entry.validationType ?? "Dismiss";
  const field =
    (entry.field as "text" | "imageFile" | "youtubeUrl" | "root" | undefined) ??
    "root";

  if (
    field === "text" ||
    field === "imageFile" ||
    field === "youtubeUrl" ||
    field === "root"
  ) {
    return {
      type,
      text: entry.message[lang],
      field,
    };
  }

  return {
    type,
    text: entry.message[lang],
    field: "root",
  };
}
