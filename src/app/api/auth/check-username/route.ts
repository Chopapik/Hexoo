import { isUsernameTaken } from "@/features/auth/api/utils/checkUsernameUnique";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { createAppError } from "@/lib/AppError";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { username } = body;

  if (!username || typeof username !== "string") {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[auth/check-username/route.POST] Username is required.",
    });
  }

  const normalized = username.trim().toLowerCase();

  if (normalized.length === 0) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[auth/check-username/route.POST] Username cannot be empty.",
    });
  }

  const taken = await isUsernameTaken(normalized);

  return handleSuccess({
    available: !taken,
    username: normalized,
  });
});
