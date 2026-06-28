import { registerUser } from "@/features/auth/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { createAppError } from "@/lib/AppError";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { assertAuthRegisterRateLimit } from "@/lib/rateLimit";

export const POST = withErrorHandling(async (req) => {
  const body = await req.json();
  const { idToken, refreshToken, name, email, recaptchaToken } = body;

  await assertAuthRegisterRateLimit(req, email);

  if (!recaptchaToken) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "[auth/register/route.POST] reCAPTCHA token missing.",
    });
  }

  await verifyRecaptchaToken(recaptchaToken, {
    expectedAction: "register_confirm",
  });

  const resp = await registerUser({ idToken, refreshToken, name, email });
  return handleSuccess(resp, 201);
});
