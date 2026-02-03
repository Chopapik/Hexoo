import { deleteAccount } from "@/features/me/api/meService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const DELETE = withErrorHandling(async () => {
  const session = await getUserFromSession();
  await deleteAccount(session);
  return handleSuccess({ message: "Account deleted" });
});
