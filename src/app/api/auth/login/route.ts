import { createSession } from "@/features/auth/api/authService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { createAppError } from "@/lib/ApiError";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();
  const { idToken, recaptchaToken } = body;

  if (!recaptchaToken) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "No reCAPTCHA login route",
    });
  }

  if (!idToken) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "No idToken in login route",
    });
  }

  await verifyRecaptchaToken(recaptchaToken);

  // Wywołujemy nową funkcję createSession zamiast starego loginUser
  const result = await createSession(idToken);

  return handleSuccess(result);
});
