import { registerUser } from "@/features/auth/api/authService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { createAppError } from "@/lib/ApiError";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

export const POST = withErrorHandling(async (req) => {
  const body = await req.json();

  const { recaptchaToken, ...registerData } = body;
  if (!recaptchaToken) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "Brak weryfikacji reCAPTCHA",
    });
  }

  await verifyRecaptchaToken(recaptchaToken);

  const resp = await registerUser(registerData);
  return handleSuccess(resp);
});
