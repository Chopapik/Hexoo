import { loginUser } from "@/features/auth/api/authService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { sendSuccess } from "@/lib/http/responseHelpers";
import { createAppError } from "@/lib/ApiError";

export const POST = withErrorHandling(async (req) => {
  const body = await req.json();
  const result = await loginUser(body);

  if (!result) {
    throw createAppError({
      code: "INTERNAL_ERROR",
      message: "No result in login route",
    });
  } else {
    const response = sendSuccess({ user: result.user });

    response.cookies.set({
      name: "session",
      value: result.sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 5,
      path: "/",
    });
    return response;
  }
});
