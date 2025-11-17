import { logoutUser } from "@/features/auth/api/authService";
import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { sendSuccess } from "@/lib/http/responseHelpers";

export const POST = withErrorHandling(async () => {
  const result = await logoutUser();
  return sendSuccess(result);
});
