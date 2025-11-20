import { registerUser } from "@/features/auth/api/authService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const POST = withErrorHandling(async (req) => {
  const data = await req.json();
  const resp = await registerUser(data);
  return handleSuccess(resp);
});
