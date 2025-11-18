import { registerUser } from "@/features/auth/api/authService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { sendSuccess } from "@/lib/http/responseHelpers";

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();

  const result = await registerUser(body);

  return sendSuccess({
    message: "Account created",
    user: result.user,
  });
});
