import { updatePassword } from "@/features/me/api/meService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const PUT = withErrorHandling(async (req: Request) => {
  const body = await req.json();

  const result = await updatePassword(body);

  const response = handleSuccess({ user: result.user });

  return response;
});
