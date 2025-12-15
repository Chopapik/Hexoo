import { createAppError } from "./AppError";

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

export async function verifyRecaptchaToken(token: string) {
  if (!SECRET_KEY) {
    // On localhost we often forget the key, so we throw a clear error
    throw createAppError({
      code: "INTERNAL_ERROR",
      message: "Server misconfiguration: RECAPTCHA_SECRET_KEY missing",
    });
  }

  try {
    // Google requires form-data/url-encoded, not JSON
    const params = new URLSearchParams();
    params.append("secret", SECRET_KEY);
    params.append("response", token);

    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await res.json();

    // data.score is a result from 0.0 (bot) to 1.0 (human).
    // The default threshold is 0.5.

    if (!data.success || data.score < 0.5) {
      throw createAppError({
        code: "FORBIDDEN", // 403 - Forbidden
        message: "Weryfikacja reCAPTCHA nieudana. Wykryto bota.",
        data: { score: data.score, errors: data["error-codes"] },
      });
    }

    return true; // It is a human
  } catch (error: any) {
    // If this is our ApiError, pass it through
    if (error?.code) throw error;

    // Other network errors
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "Błąd łączenia z usługą reCAPTCHA",
      details: error,
    });
  }
}
