// app/api/me/password/route.ts
import { updatePassword } from "@/features/me/api/meService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { sendSuccess } from "@/lib/http/responseHelpers";
import { createAppError } from "@/lib/ApiError";

export const PUT = withErrorHandling(async (req: Request) => {
  const body = await req.json();

  const result = await updatePassword(body);

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
});
