import formatLoginError from "./formatLoginError";
import { AuthError } from "./AuthError";

export async function processLoginError(error: any) {
  if (error instanceof Error) {
    const data = formatLoginError(error);
    throw new AuthError(data.message, {
      code: 400,
      type: "validation",
      data,
    });
  }

  console.log("lock: ", error);
  const maybeFb = error?.data ?? error?.raw ?? error;
  const mapped = formatLoginError(maybeFb);

  if (mapped) {
    throw new AuthError(mapped.message, {
      code: 400,
      type: "validation",
      data: mapped,
    });
  }

  console.error("Nieoczekiwany error w processLoginError:", error);
  throw new AuthError("Nieoczekiwany błąd serwera", {
    code: 500,
    type: "critical",
  });
}
