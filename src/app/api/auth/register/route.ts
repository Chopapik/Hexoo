import { registerUser } from "@/features/auth/api/authService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { createAppError } from "@/lib/ApiError";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

export const POST = withErrorHandling(async (req) => {
  const body = await req.json();
  const { idToken, name, email, recaptchaToken } = body;

  if (!recaptchaToken) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "[auth/register/route.POST] reCAPTCHA token missing.",
    });
  }

  await verifyRecaptchaToken(recaptchaToken);

  const resp = await registerUser({ idToken, name, email });
  return handleSuccess(resp);
});
