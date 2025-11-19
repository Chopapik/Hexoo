import { deleteAccount } from "@/features/me/api/meService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const DELETE = withErrorHandling(async () => {
  await deleteAccount();
  return handleSuccess({ message: "Account deleted" });
});
