import { registerUser } from "@/features/auth/api/authService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();

  const result = await registerUser(body);

  return handleSuccess({
    message: "Account created",
    user: result.user,
  });
});
