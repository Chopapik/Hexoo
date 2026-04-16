import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const GET = withErrorHandling(async () => {
  await getUserFromSession();
  return handleSuccess({ active: true });
});
