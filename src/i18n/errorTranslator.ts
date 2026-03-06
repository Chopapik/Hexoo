import { ApiError } from "@/lib/AppError";
import { translateError } from "./errorCatalog";

export function translateApiError(err: ApiError, lang: "pl" | "en" = "pl") {
  return translateError(err, lang);
}
