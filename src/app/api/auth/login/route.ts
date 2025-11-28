import { loginUser } from "@/features/auth/api/authService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { createAppError } from "@/lib/ApiError";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import axios from "axios";

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();

  const { recaptchaToken, ...loginData } = body;
  if (!recaptchaToken) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "Brak weryfikacji reCAPTCHA",
    });
  }

  await verifyRecaptchaToken(recaptchaToken);

  const result = await loginUser(loginData);

  return handleSuccess(result);
});
