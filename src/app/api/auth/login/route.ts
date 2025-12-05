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
      message: "[auth/login/route.POST] No reCAPTCHA token provided.",
    });
  }

  if (!idToken) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[auth/login/route.POST] No idToken provided.",
    });
  }

  await verifyRecaptchaToken(recaptchaToken);

  // Wywołujemy nową funkcję createSession zamiast starego loginUser
  const result = await createSession(idToken);

  return handleSuccess(result);
});
