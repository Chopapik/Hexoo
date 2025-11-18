import { loginUser } from "@/features/auth/api/authService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { sendSuccess } from "@/lib/http/responseHelpers";

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();
  const result = await loginUser(body);

  return sendSuccess({ message: "Logged in", user: result.user });
});
