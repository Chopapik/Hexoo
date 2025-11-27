import { updatePassword } from "@/features/me/api/meService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { createAppError } from "@/lib/ApiError";

export const PUT = withErrorHandling(async (req: Request) => {
  const body = await req.json();

  const { recaptchaToken } = body;

  if (!recaptchaToken) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "Brak weryfikacji reCAPTCHA",
    });
  }

  await verifyRecaptchaToken(recaptchaToken);

  const result = await updatePassword(body);

  const response = handleSuccess({ user: result.user });

  return response;
});
