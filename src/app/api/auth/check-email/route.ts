import { adminAuth } from "@/lib/firebaseAdmin";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { createAppError } from "@/lib/AppError";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { email } = body;

  if (!email || typeof email !== "string") {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[auth/check-email/route.POST] Email is required.",
    });
  }

  const normalized = email.trim().toLowerCase();

  if (normalized.length === 0) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[auth/check-email/route.POST] Email cannot be empty.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[auth/check-email/route.POST] Invalid email format.",
    });
  }

  let isTaken = false;
  try {
    await adminAuth.getUserByEmail(normalized);
    isTaken = true;
  } catch (error: any) {
    if (error?.code === "auth/user-not-found") {
      isTaken = false;
    } else {
      console.error("Error checking email availability:", error);
      isTaken = false;
    }
  }

  return handleSuccess({
    available: !isTaken,
    email: normalized,
  });
});
