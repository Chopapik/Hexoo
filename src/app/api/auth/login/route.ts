import { createSession } from "@/features/auth/api/authService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { createAppError } from "@/lib/AppError";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(async (req: NextRequest) => {
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

  const result = await createSession(idToken);

  return handleSuccess(result);
});
