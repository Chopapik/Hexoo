import { createAppError } from "./ApiError";

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

export async function verifyRecaptchaToken(token: string) {
  if (!SECRET_KEY) {
    // Na localhoście często zapominamy klucza, więc rzucamy jasny błąd
    throw createAppError({
      code: "INTERNAL_ERROR",
      message: "Server misconfiguration: RECAPTCHA_SECRET_KEY missing",
    });
  }

  try {
    // Google wymaga form-data/url-encoded, nie JSON
    const params = new URLSearchParams();
    params.append("secret", SECRET_KEY);
    params.append("response", token);

    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await res.json();

    // data.score to wynik od 0.0 (bot) do 1.0 (człowiek).
    // Domyślny próg to 0.5.
    if (!data.success || data.score < 0.5) {
      throw createAppError({
        code: "FORBIDDEN", // 403 - Zabronione
        message: "Weryfikacja reCAPTCHA nieudana. Wykryto bota.",
        data: { score: data.score, errors: data["error-codes"] },
      });
    }

    return true; // Jest człowiekiem
  } catch (error: any) {
    // Jeśli to nasz ApiError, puszczamy go dalej
    if (error?.code) throw error;

    // Inne błędy sieciowe
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "Błąd łączenia z usługą reCAPTCHA",
      details: error,
    });
  }
}
