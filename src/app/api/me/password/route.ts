import { updatePassword } from "@/features/me/api/meService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { createAppError } from "@/lib/ApiError";
import { NextRequest } from "next/server";

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();

  const { recaptchaToken, ...newPasswordData } = body;

  if (!recaptchaToken) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "[me/password/route.PUT] reCAPTCHA token missing.",
    });
  }

  await verifyRecaptchaToken(recaptchaToken);

  const result = await updatePassword(newPasswordData);

  const response = handleSuccess();

  return response;
});
