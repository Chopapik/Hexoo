import { logoutUser } from "@/features/auth/api/services/authService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const POST = withErrorHandling(async () => {
  const result = await logoutUser();
  return handleSuccess(result);
});
