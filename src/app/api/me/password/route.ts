import { updatePassword } from "@/features/me/api/meService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { createAppError } from "@/lib/AppError";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const session = await getUserFromSession();
  const body = await req.json();

  const { recaptchaToken, ...newPasswordData } = body;

  if (!recaptchaToken) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "[me/password/route.PUT] reCAPTCHA token missing.",
    });
  }

  await verifyRecaptchaToken(recaptchaToken);

  const result = await updatePassword(session, newPasswordData);

  const response = handleSuccess();

  return response;
});
